import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  useLocalSearchParams,
} from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

import api from '@/services/api';

import { VetHeader } from '@/components/vet/VetHeader';
import { VetStats } from '@/components/vet/VetStats';
import { VetTabs } from '@/components/vet/VetTabs';
import { VetAbout } from '@/components/vet/VetAbout';
import { VetAvailability } from '@/components/vet/VetAvailability';
import { VetReviews } from '@/components/vet/VetReviews';
import { BookButton } from '@/components/vet/BookButton';

type TabType =
  | 'about'
  | 'availability'
  | 'reviews';

interface SpecialistProfile {
  id: string;

  firstName: string;

  lastName: string;

  experienceYears: number;

  rating: number;

  patientsCount: number;

  avatarUrl?: string;

  about?: string;

  address?: string;

  clinicName?: string;

  phoneNumber?: string;

  education?: string;

  languages?: string[];

  specialty?: string;

  serviceType?: string;
}

export default function VetProfileScreen() {
  const { colors, spacing } =
    useTheme();

  const { id, type } =
    useLocalSearchParams();

  const [tab, setTab] =
    useState<TabType>('about');

  const [refreshing, setRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [profile, setProfile] =
    useState<SpecialistProfile | null>(
      null
    );

  useEffect(() => {
    loadProfile();
  }, [id, type]);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const endpoint =
  type === 'service'
    ? `/specialist-service/service-providers/${id}`
    : `/specialist-service/veterinarians/profile/${id}`;

      const res = await api.get(endpoint);

      const data = res.data;

      setProfile({
        id: String(
  type === 'service'
    ? data.serviceId
    : data.vetId
),

        firstName:
          data.firstName || '',

        lastName:
          data.lastName || '',

        experienceYears:
          data.experienceYears || 0,

        rating:
  data.rating || 0,

        patientsCount:
          data.patientsCount || 0,

        avatarUrl: data.avatarUrl,

        about:
          data.about ||
          data.description ||
          '',

        address:
          data.address || '',

        clinicName:
          data.clinicName ||
          data.businessName ||
          '',

        phoneNumber:
          data.phoneNumber || '',

        education:
          data.education || '',

        languages:
          data.languages || [],

        specialty:
  type === 'service'
    ? data.serviceCategory
    : 'Veterinarian',

        serviceType:
          data.serviceType || '',
      });
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await loadProfile();

    setRefreshing(false);
  };

  if (loading || !profile) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor:
            colors.background.secondary,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          colors.background.secondary,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={
              colors.primary.main
            }
            colors={[
              colors.primary.main,
            ]}
          />
        }
      >
        <VetHeader
        vet={profile}
        type={
          type === 'service'
            ? 'service'
            : 'vet'
        }
      />

        <VetStats vet={profile} />

        <VetTabs
          active={tab}
          onChange={setTab}
        />

        {tab === 'about' && (
          <VetAbout vet={profile} />
        )}

        {tab === 'availability' && (
          <VetAvailability />
        )}

        {tab === 'reviews' && (
          <VetReviews
  vetId={profile.id}
  type={
    type === 'service'
      ? 'service'
      : 'vet'
  }
/>
        )}
      </ScrollView>

      <BookButton
        vetId={profile.id}
      type={
    type === 'service'
      ? 'service'
      : 'vet'
  }
/>
    </View>
  );
}