import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

import { VetSearchBar } from '@/components/list/VetSearchBar';
import { VetFilterChips } from '@/components/list/VetFilterChips';
import { VetCard } from '@/components/list/VetCard';
import { VetsListSkeleton } from '@/components/list/VetsListSkeleton';

interface Vet {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  pricePerHour: number;
  distance?: number;
  clinicName: string;
  isAvailableToday: boolean;
  phoneNumber: string;
  address: string;
}

type SortType = 'rating' | 'experience' | 'price' | 'available';

export default function VetsListScreen() {
  const { colors, typography } = useTheme();
  const router = useRouter();

  const [vets, setVets] = useState<Vet[]>([]);
  const [filteredVets, setFilteredVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortType>('rating');

  const mockVets: Vet[] = [
    {
      id: '1',
      firstName: 'Leslie',
      lastName: 'Alexander',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      specialty: 'Pediatrician',
      experienceYears: 8,
      rating: 5.0,
      reviewsCount: 156,
      pricePerHour: 85,
      distance: 1.2,
      clinicName: 'Springfield Pet Clinic',
      isAvailableToday: true,
      phoneNumber: '+1 (555) 123-4567',
      address: 'Elm Street',
    },
    {
      id: '2',
      firstName: 'Ronald',
      lastName: 'Richards',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
      specialty: 'Cardiologist',
      experienceYears: 12,
      rating: 4.9,
      reviewsCount: 89,
      pricePerHour: 120,
      distance: 2.5,
      clinicName: 'Heart Care Center',
      isAvailableToday: false,
      phoneNumber: '+1 (555) 234-5678',
      address: 'Oak Street',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setVets(mockVets);
      setFilteredVets(mockVets);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortVets();
  }, [searchQuery, selectedCategory, sortBy, vets]);

  const filterAndSortVets = () => {
    let filtered = [...vets];

    // 🔍 SEARCH
    if (searchQuery) {
      filtered = filtered.filter(
        (vet) =>
          `${vet.firstName} ${vet.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          vet.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vet.clinicName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 🏷 CATEGORY
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (vet) => vet.specialty === selectedCategory
      );
    }

    // 🟢 AVAILABLE FILTER (из кнопки сортировки)
    if (sortBy === 'available') {
      filtered = filtered.filter((vet) => vet.isAvailableToday);
    }

    // 📊 SORT
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      if (sortBy === 'price') return a.pricePerHour - b.pricePerHour;
      return 0;
    });

    setFilteredVets(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
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
        }}
      >
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Find a Vet
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          {filteredVets.length} specialists available
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
        data={filteredVets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VetCard
            vet={item}
            onPress={() => router.push(`/vet-profile?id=${item.id}`)}
          />
        )}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}