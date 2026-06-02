import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import api from '@/services/api';

import { VetSearchBar } from '@/components/list/VetSearchBar';
import { VetFilterChips } from '@/components/list/VetFilterChips';
import { VetCard } from '@/components/list/VetCard';
import { VetsListSkeleton } from '@/components/list/VetsListSkeleton';

interface Specialist {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  pricePerVisit: number;  // ✅ переименовано
  distance?: number;
  clinicName: string;
  isAvailableToday: boolean;
  address: string;
  specialistType: 'VET' | 'SERVICE';
}

type SortType = 'rating' | 'experience' | 'price' | 'available';

export default function VetsListScreen() {
  const { colors, typography } = useTheme();
  const router = useRouter();

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortType>('rating');

  const loadSpecialists = useCallback(async () => {
    try {
      setLoading(true);
      
      const [vetsResponse, servicesResponse] = await Promise.all([
        api.get('/specialist-service/veterinarians'),
        api.get('/specialist-service/service-providers'),
      ]);
      
      // Маппинг ветеринаров
      const vets: Specialist[] = (vetsResponse.data || []).map((v: any) => ({
        id: String(v.vetId || v.id),
        firstName: v.firstName || '',
        lastName: v.lastName || '',
        avatarUrl: v.avatarUrl || `https://ui-avatars.com/api/?name=${v.firstName}+${v.lastName}&background=random`,
        specialty: 'Veterinarian',
        experienceYears: v.experienceYears || 0,
        rating: v.rating || v.ratingAverage || 0,
        reviewsCount: v.reviewsCount || 0,
        pricePerVisit: v.pricePerVisit || 0,  // ✅ переименовано
        distance: v.distance,
        clinicName: v.clinicName || 'Private Practice',
        isAvailableToday: v.isAvailableToday ?? true,
        address: v.address || 'Address not specified',
        specialistType: 'VET',
      }));
      
      // Маппинг сервис-провайдеров
      const services: Specialist[] = (servicesResponse.data || []).map((s: any) => ({
        id: String(s.serviceId || s.serviceProviderId || s.id),
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        avatarUrl: s.avatarUrl || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=random`,
        specialty: s.serviceCategory || 'Service Provider',
        experienceYears: s.experienceYears || 0,
        rating: s.rating || s.ratingAverage || 0,
        reviewsCount: s.reviewsCount || 0,
        pricePerVisit: s.pricePerVisit || 0,  
        distance: s.distance,
        clinicName: s.businessName || s.clinicName || s.city || 'Mobile Service',
        isAvailableToday: s.isAvailableToday ?? true,
        address: s.address || s.city || 'Location available upon booking',
        specialistType: 'SERVICE',
      }));
      
      const allSpecialists = [...vets, ...services];
      setSpecialists(allSpecialists);
      setFilteredSpecialists(allSpecialists);
    } catch (error) {
      console.error('Error loading specialists:', error);
      // ✅ Добавлен Alert
      Alert.alert('Ошибка', 'Не удалось загрузить список специалистов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecialists();
  }, [loadSpecialists]);

  useEffect(() => {
    filterAndSortSpecialists();
  }, [searchQuery, selectedCategory, sortBy, specialists]);

  const filterAndSortSpecialists = () => {
    let filtered = [...specialists];

    // Поиск по имени, специальности, клинике
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
          s.specialty.toLowerCase().includes(query) ||
          s.clinicName.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории (vet vs service)
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'Veterinarian') {
        filtered = filtered.filter((s) => s.specialistType === 'VET');
      } else if (selectedCategory === 'Service Provider') {
        filtered = filtered.filter((s) => s.specialistType === 'SERVICE');
      } else {
        filtered = filtered.filter((s) => 
          s.specialty.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }
    }

    // Фильтр "Доступен сегодня"
    if (sortBy === 'available') {
      filtered = filtered.filter((s) => s.isAvailableToday);
    }

    // Сортировка
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
      if (sortBy === 'price') return (a.pricePerVisit || 0) - (b.pricePerVisit || 0);
      return 0;
    });

    setFilteredSpecialists(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSpecialists();
    setRefreshing(false);
  };

  const handleSpecialistPress = (specialist: Specialist) => {
    router.push({
      pathname: '/specialist-profile',
      params: { 
        id: specialist.id,
        type: specialist.specialistType === 'VET' ? 'vet' : 'service',
      },
    });
  };

  if (loading) {
    return <VetsListSkeleton />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 16,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border?.light || '#E5E7EB',
        }}
      >
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Специалисты
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          {filteredSpecialists.length} специалистов найдено
        </Text>
      </View>

      {/* SEARCH BAR */}
      <VetSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* FILTER CHIPS */}
      <VetFilterChips
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* RESULTS COUNT */}
      {filteredSpecialists.length > 0 && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 8,
            backgroundColor: colors.background.tertiary,
          }}
        >
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Показано {filteredSpecialists.length} {filteredSpecialists.length === 1 ? 'результат' : 'результатов'}
          </Text>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={filteredSpecialists}
        keyExtractor={(item) => item.id}  // ✅ упрощено (id уникален)
        renderItem={({ item }) => (
          <VetCard
            vet={item}
            onPress={() => handleSpecialistPress(item)}
          />
        )}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && filteredSpecialists.length === 0 ? (
            <View 
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                paddingTop: 60,
              }}
            >
              <Text style={{ color: colors.text.secondary, textAlign: 'center', fontSize: 16 }}>
                Ничего не найдено
              </Text>
              <Text style={{ color: colors.text.tertiary, fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                Попробуйте изменить параметры поиска
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}