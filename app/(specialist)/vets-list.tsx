import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
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
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  specialty?: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  pricePerVisit?: number;
  clinicName?: string;
  isAvailableToday?: boolean;
  phoneNumber?: string;
  address?: string;
  city?: string;
  about?: string;
  education?: string;
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
      
      const vets: Specialist[] = (vetsResponse.data || []).map((v: any) => ({
        id: v.vetId || v.id,
        userId: v.userId,
        firstName: v.firstName || '',
        lastName: v.lastName || '',
        avatarUrl: v.avatarUrl,
        specialty: 'Veterinarian',
        experienceYears: v.experienceYears || 0,
        rating: v.rating || v.ratingAverage || 0,
        reviewsCount: v.reviewsCount || 0,
        pricePerVisit: v.pricePerVisit,
        clinicName: v.clinicName,
        phoneNumber: v.phoneNumber,
        address: v.address,
        city: v.city,
        about: v.about,
        education: v.education,
        specialistType: 'VET',
      }));
      
      const services: Specialist[] = (servicesResponse.data || []).map((s: any) => ({
        id: s.serviceId || s.id,
        userId: s.userId,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        avatarUrl: s.avatarUrl,
        specialty: s.serviceCategory || 'Service Provider',
        experienceYears: s.experienceYears || 0,
        rating: s.rating || s.ratingAverage || 0,
        reviewsCount: s.reviewsCount || 0,
        pricePerVisit: s.pricePerVisit,
        clinicName: s.businessName,
        phoneNumber: s.phoneNumber,
        address: s.address,
        city: s.city,
        about: s.about,
        education: s.education,
        specialistType: 'SERVICE',
      }));
      
      const allSpecialists = [...vets, ...services];
      setSpecialists(allSpecialists);
      setFilteredSpecialists(allSpecialists);
    } catch (error) {
      console.error('Error loading specialists:', error);
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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
          (s.specialty?.toLowerCase() || '').includes(query) ||
          (s.clinicName?.toLowerCase() || '').includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (s) => s.specialistType === selectedCategory.toUpperCase()
      );
    }

    if (sortBy === 'available') {
      filtered = filtered.filter((s) => s.isAvailableToday);
    }

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
        id: specialist.id.toString(),
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
          paddingVertical: 12,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border?.light || '#eee',
        }}
      >
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Поиск специалиста
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          {filteredSpecialists.length} специалистов найдено
        </Text>
      </View>

      {/* SEARCH + FILTER */}
      <VetSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* CATEGORY CHIPS */}
      <VetFilterChips
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* LIST */}
      <FlatList
        data={filteredSpecialists}
        keyExtractor={(item) => `${item.specialistType}-${item.id}`}
        renderItem={({ item }) => (
          <VetCard
            vet={item as any}
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
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>
                Ничего не найдено
              </Text>
              <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Попробуйте изменить параметры поиска
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}