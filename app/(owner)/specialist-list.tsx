import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

import { useRouter } from 'expo-router';

import api from '@/services/api';

import { VetSearchBar } from '@/components/list/VetSearchBar';

import { VetCard } from '@/components/list/VetCard';

type SpecialistType =
  | 'vets'
  | 'services';

interface Specialist {
  id: string;

  firstName: string;

  lastName: string;

  avatarUrl?: string;

  specialty?: string;

  experienceYears?: number;

  rating?: number;

  reviewsCount?: number;

  pricePerHour?: number;

  clinicName?: string;

  isAvailableToday?: boolean;

  phoneNumber?: string;

  address?: string;
}

type SortType =
  | 'rating'
  | 'experience'
  | 'price'
  | 'available';

export default function VetsListScreen() {
  const { colors, typography } =
    useTheme();

  const router = useRouter();

  const [tab, setTab] =
    useState<SpecialistType>('vets');

  const [vets, setVets] =
  useState<Specialist[]>([]);

const [services, setServices] =
  useState<Specialist[]>([]);

  const [
    filteredSpecialists,
    setFilteredSpecialists,
  ] = useState<Specialist[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [sortBy, setSortBy] =
    useState<SortType>('rating');
useEffect(() => {
  loadAllData();
}, []);

  useEffect(() => {
  filterAndSort();
}, [
  searchQuery,
  sortBy,
  vets,
  services,
  tab,
]);

  const loadAllData = async () => {
  try {
    setLoading(true);

    const [
      vetsRes,
      servicesRes,
    ] = await Promise.all([
      api.get(
        '/specialist-service/veterinarians'
      ),

      api.get(
        '/specialist-service/service-providers'
      ),
    ]);

    const mappedVets =
  vetsRes.data.map((item: any) => ({
    id:
      item.vetId.toString(),

    firstName:
      item.firstName || '',

    lastName:
      item.lastName || '',

    avatarUrl:
      item.avatarUrl,

    specialty:
      'Veterinarian',

    experienceYears:
      item.experienceYears || 0,

    rating:
      item.rating || 0,

    reviewsCount:
      item.reviewsCount || 0,

    clinicName:
      item.clinicName || '',

    phoneNumber:
      item.phoneNumber || '',

    address:
      item.address || '',

    pricePerHour:
      item.pricePerVisit || 0,

    isAvailableToday: true,
  }));

   const mappedServices =
  servicesRes.data.map(
    (item: any) => ({
        id: String(
  item.serviceProviderId ||
  item.serviceId ||
  item.id ||
  ''
),

      firstName:
        item.firstName || '',

      lastName:
        item.lastName || '',

      avatarUrl:
        item.avatarUrl,

      specialty:
        item.serviceCategory ||
        'Service Provider',

      experienceYears:
        item.experienceYears || 0,

      rating:
        item.rating || 0,

      reviewsCount:
        item.reviewsCount || 0,

      phoneNumber:
        item.phoneNumber || '',

      address:
        item.address || '',

      pricePerHour:
        item.pricePerVisit || 0,

      clinicName:
        item.city || '',

      isAvailableToday: true,
    })
  );

    setVets(mappedVets);

    setServices(mappedServices);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  const filterAndSort = () => {
    let filtered =
  tab === 'vets'
    ? [...vets]
    : [...services];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          `${item.firstName} ${item.lastName}`
            .toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            ) ||
          item.specialty
            ?.toLowerCase()
            .includes(
              searchQuery.toLowerCase()
            )
      );
    }

    if (sortBy === 'available') {
      filtered = filtered.filter(
        (item) => item.isAvailableToday
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'rating')
        return (
          (b.rating || 0) -
          (a.rating || 0)
        );

      if (sortBy === 'experience')
        return (
          (b.experienceYears || 0) -
          (a.experienceYears || 0)
        );

      if (sortBy === 'price')
        return (
          (a.pricePerHour || 0) -
          (b.pricePerHour || 0)
        );

      return 0;
    });

    setFilteredSpecialists(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await loadAllData();

    setRefreshing(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          colors.background.secondary,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 16,
          backgroundColor:
            colors.background.primary,
        }}
      >
        <Text
          style={[
            typography.h2,
            {
              color:
                colors.text.primary,
            },
          ]}
        >
          Specialists
        </Text>

        <Text
          style={[
            typography.body2,
            {
              color:
                colors.text.secondary,
            },
          ]}
        >
          {
            filteredSpecialists.length
          }{' '}
          available
        </Text>

        {/* TABS */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 16,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setTab('vets')
            }
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,

              alignItems: 'center',

              backgroundColor:
                tab === 'vets'
                  ? colors.primary.main
                  : colors.card.default,
            }}
          >
            <Text
              style={{
                color:
                  tab === 'vets'
                    ? '#fff'
                    : colors.text.primary,

                fontWeight: '600',
              }}
            >
              Veterinarians
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setTab('services')
            }
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,

              alignItems: 'center',

              backgroundColor:
                tab === 'services'
                  ? colors.primary.main
                  : colors.card.default,
            }}
          >
            <Text
              style={{
                color:
                  tab === 'services'
                    ? '#fff'
                    : colors.text.primary,

                fontWeight: '600',
              }}
            >
              Services
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH */}
      <VetSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* LIST */}
      <FlatList
        data={filteredSpecialists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VetCard
            vet={item}
           onPress={() =>
    router.push({
    pathname:
      '/specialist-profile',

    params: {
      id: item.id,

      type:
        tab === 'services'
          ? 'service'
          : 'vet',

    },
  })
}
          />
        )}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      />
    </SafeAreaView>
  );
}