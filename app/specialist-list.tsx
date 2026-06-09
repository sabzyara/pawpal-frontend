import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import api from '@/services/api';

import { VetSearchBar } from '@/components/list/VetSearchBar';
import { VetFilterChips } from '@/components/list/VetFilterChips';
import { VetCard } from '@/components/list/VetCard';
import { VetsListSkeleton } from '@/components/list/VetsListSkeleton';
import "./i18n";
import { useTranslation } from 'react-i18next';

interface Specialist {
  id: string;
  specialistId: number;        
  userId: number;              
  firstName: string;
  lastName: string;
  avatarUrl: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  pricePerVisit: number;
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
  const {t} = useTranslation();
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
      

      const vets: Specialist[] = (vetsResponse.data || [])
        .filter((v: any) => v.vetId) 
        .map((v: any) => ({
          id: `vet_${v.vetId}`, 
          specialistId: v.vetId,
          userId: v.userId,
          firstName: v.firstName || '',
          lastName: v.lastName || '',
          avatarUrl: v.avatarUrl || `https://ui-avatars.com/api/?name=${v.firstName}+${v.lastName}&background=random`,
          specialty:
            v.specialty ||
            v.specialization ||
            t("specialists.veterinarian"),
          experienceYears: v.experienceYears || 0,
          rating: v.ratingAverage || v.rating || 0,
          reviewsCount: v.reviewsCount || 0,
          pricePerVisit: v.pricePerVisit || 0,
          distance: v.distance,
          clinicName:
            v.clinicName ||
            t("specialists.privatePractice"),
          isAvailableToday: v.isAvailableToday ?? true,
          address:
            v.address ||
            t("specialists.addressNotSpecified"),
          specialistType: 'VET',
        }));
      
      const services: Specialist[] = (servicesResponse.data || [])
        .filter((s: any) => s.serviceId) 
        .map((s: any) => ({
          id: `service_${s.serviceId}`, 
          specialistId: s.serviceId,
          userId: s.userId,
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          avatarUrl: s.avatarUrl || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=random`,
          specialty:
            s.serviceCategory ||
            t("specialists.serviceProvider"),
          experienceYears: s.experienceYears || 0,
          rating: s.ratingAverage || s.rating || 0,
          reviewsCount: s.reviewsCount || 0,
          pricePerVisit: s.pricePerVisit || 0,
          distance: s.distance,
          clinicName:
            s.businessName ||
            s.clinicName ||
            s.city ||
            t("specialists.mobileService"),
          isAvailableToday: s.isAvailableToday ?? true,
          address:
          s.address ||
          s.city ||
          t("specialists.locationOnBooking"),
          specialistType: 'SERVICE',
        }));
      
      const allSpecialists = [...vets, ...services];
      setSpecialists(allSpecialists);
      setFilteredSpecialists(allSpecialists);
    } catch (error) {
      console.error('Error loading specialists:', error);
      Alert.alert(
        t("specialists.error"),
        t("specialists.loadFailed")
      );
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
          s.specialty.toLowerCase().includes(query) ||
          s.clinicName.toLowerCase().includes(query)
      );
    }


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
    if (!specialist.userId) {
      Alert.alert(
        t("specialists.error"),
        t("specialists.incompleteData")
      );
      return;
    }
    
    router.push({
      pathname: '/specialist-profile',
      params: { 
        id: specialist.userId,  
        type: specialist.specialistType === 'VET' ? 'vet' : 'service',
        name: `${specialist.firstName} ${specialist.lastName}`,
      },
    });
  };


  const keyExtractor = useCallback((item: Specialist) => {

    if (item?.id && item.id !== 'undefined' && item.id !== 'null') {
      return item.id;
    }

    return `${item.specialistType}_${item.userId || item.specialistId}_${Date.now()}_${Math.random()}`;
  }, []);

  if (loading) {
    return <VetsListSkeleton />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 16,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 0,
        }}
      >
        <Text
          style={[
            typography.h2,
            {
              color: colors.text.primary,
            },
          ]}
        >
          {t("specialists.title")}
        </Text>
        
        <Text
          style={[
            typography.body2,
            {
              color: colors.text.secondary,
              marginTop: 4,
            },
          ]}
        >
          {t("specialists.availableCount", {
            count: filteredSpecialists.length,
          })}
        </Text>
      </View>

      <VetSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <VetFilterChips
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <FlatList
        data={filteredSpecialists}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <VetCard
            vet={item}
            onPress={() => handleSpecialistPress(item)}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
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
                paddingTop: 80,
              }}
            >
              <Ionicons
                name="search-outline"
                size={64}
                color={colors.text.tertiary}
              />
              
              <Text
                style={[
                  typography.h4,
                  {
                    color: colors.text.primary,
                    marginTop: 16,
                  },
                ]}
              >
                {t("specialists.emptyTitle")}
              </Text>
              
              <Text
                style={[
                  typography.body2,
                  {
                    color: colors.text.secondary,
                    textAlign: 'center',
                    marginTop: 8,
                    paddingHorizontal: 40,
                  },
                ]}
              >
                {t("specialists.emptyDescription")}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}