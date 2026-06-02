import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text, 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { VetHeader } from '@/components/vet/VetHeader';
import { VetStats } from '@/components/vet/VetStats';
import { VetTabs } from '@/components/vet/VetTabs';
import { VetAbout } from '@/components/vet/VetAbout';
import { VetAvailability } from '@/components/vet/VetAvailability';
import { VetReviews } from '@/components/vet/VetReviews';
import { VetEditProfile } from '@/components/vet/VetEditProfile';
import { VetManage } from '@/components/vet/VetManage';
import { BookButton } from '@/components/vet/BookButton';
import api from '@/services/api';

type TabType = 'about' | 'availability' | 'reviews' | 'edit' | 'manage';

interface SpecialistProfile {
  id: number;
  userId: number;
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
  specialty?: string;
  serviceType?: string;
  pricePerVisit?: number;
  city?: string;
  licenseNumber?: string;
}

export default function VetProfileScreen() {
  const { colors, typography, spacing } = useTheme(); 
  const router = useRouter();
  const { id, type } = useLocalSearchParams();

  const [tab, setTab] = useState<TabType>('about');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null); // ✅ Добавлен error state

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      loadProfile();
    }
  }, [id, type, currentUserId]);

  const loadCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint: string;
      if (id && id !== 'me') {
        endpoint = type === 'service'
          ? `/specialist-service/service-providers/${id}`
          : `/specialist-service/veterinarians/profile/${id}`;
      } else {
        endpoint = type === 'service'
          ? `/specialist-service/service-providers/me`
          : `/specialist-service/veterinarians/me`;
      }

      const response = await api.get(endpoint);
    const data = response.data;

    const profileData: SpecialistProfile = {
      id: Number(type === 'service' ? data.serviceProviderId || data.serviceId || data.id : data.vetId || data.id),
      userId: data.userId || 0,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      experienceYears: data.experienceYears || 0,
      rating: data.ratingAverage || data.rating || 0,
      patientsCount: data.patientsCount || 0,
      avatarUrl: data.avatarUrl,
      about: data.about || data.description || '',
      address: data.address || '',
      clinicName: data.clinicName || data.businessName || '',
      phoneNumber: data.phoneNumber || '',
      education: data.education || '',
      specialty: type === 'service' ? data.serviceCategory : 'Veterinarian',
      serviceType: data.serviceType || '',
      pricePerVisit: data.pricePerVisit,
      city: data.city,
      licenseNumber: data.licenseNumber,
    };

      
      setProfile(profileData);
      const isProfileOwner = currentUserId === profileData.userId;
      setIsOwner(isProfileOwner);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error?.message || 'Не удалось загрузить профиль');
      Alert.alert('Ошибка', error?.message || 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const getSpecialistType = (): 'VET' | 'SERVICE' => {
    return type === 'service' ? 'SERVICE' : 'VET';
  };

  const getSpecialistName = (): string => {
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`.trim();
  };

  const handleProfileUpdate = useCallback(() => {
    loadProfile();
    setTab('about');
  }, [loadProfile]);

  const handleDeleteProfile = useCallback(async () => {
    Alert.alert(
      'Удаление профиля',
      'Вы уверены, что хотите удалить свой профиль? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const endpoint = type === 'service'
                ? `/specialist-service/service-providers/me`
                : `/specialist-service/veterinarians/me`;
              
              await api.delete(endpoint);
              Alert.alert('Успех', 'Профиль успешно удален');
              router.replace('/');
            } catch (error: any) {
              Alert.alert('Ошибка', error?.message || 'Не удалось удалить профиль');
            }
          },
        },
      ]
    );
  }, [type, router]);

  const shouldShowBookButton = useCallback(() => {
    if (!profile) return false;
    if (isOwner) return false;
    if (id === 'me') return false;
    return true;
  }, [profile, isOwner, id]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.secondary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background.secondary,
          padding: spacing.lg,
        }}
      >
        <Ionicons name="alert-circle-outline" size={64} color={colors.error?.main || colors.primary.main} />
        <Text style={[typography.h4, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]}>
          Профиль не найден
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: spacing.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.primary.main,
            borderRadius: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.secondary,
      }}
    >
      {/* Кнопка назад */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 60,
          left: 20,
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 20,
          padding: 8,
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: shouldShowBookButton() ? 120 : 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        <VetHeader
          vet={profile}
          type={type === 'service' ? 'service' : 'vet'}
        />

        <VetStats vet={profile} />

        <VetTabs
          active={tab}
          onChange={setTab}
          isOwner={isOwner}
        />

        {tab === 'about' && <VetAbout vet={profile} />}

        {tab === 'availability' && (
          <VetAvailability
            specialistId={profile.id}
            specialistType={getSpecialistType()}
          />
        )}

        {tab === 'reviews' && (
          <VetReviews
            vetId={profile.id}
            type={type === 'service' ? 'service' : 'vet'}
          />
        )}

        {tab === 'edit' && isOwner && (
          <VetEditProfile
            profile={profile}
            type={type === 'service' ? 'service' : 'vet'}
            onUpdate={handleProfileUpdate}
          />
        )}

        {tab === 'manage' && isOwner && (
          <VetManage
            specialistId={profile.id}
            specialistType={getSpecialistType()}
            onDelete={handleDeleteProfile}
          />
        )}
      </ScrollView>

      {/* Кнопка бронирования */}
      {shouldShowBookButton() && (
        <BookButton
          specialistId={profile.id}
          specialistType={getSpecialistType()}
          specialistName={getSpecialistName()}
        />
      )}
    </View>
  );
}