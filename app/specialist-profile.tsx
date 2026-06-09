
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
import { useAuthStore } from '@/store/authStore';

type TabType = 'about' | 'availability' | 'reviews' | 'edit' | 'manage';

interface SpecialistProfile {
  id: number;          // vetId или serviceProviderId (ID из specialist-service)
  userId: number;      // ID пользователя из auth (для связи с appointment-service)
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
  
  const currentUser = useAuthStore((state) => state.user);

  const [tab, setTab] = useState<TabType>('about');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SpecialistProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [id, type, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint: string;
      let responseData: any;
      
      const isOwnProfile = !id || id === 'me';
      
      if (isOwnProfile) {
        // Загружаем свой профиль
        if (type === 'service') {
          endpoint = `/specialist-service/service-providers/me`;
        } else {
          endpoint = `/specialist-service/veterinarians/me`;
        }
        console.log('📤 Loading own profile:', endpoint);
        const response = await api.get(endpoint);
        responseData = response.data;
      } else {
        if (type === 'service') {
          endpoint = `/specialist-service/service-providers/user/${id}`;
        } else {
          endpoint = `/specialist-service/veterinarians/user/${id}`;
        }
        console.log('📤 Loading profile by userId:', endpoint);
        const response = await api.get(endpoint);
        responseData = response.data;
      }

      const profileData: SpecialistProfile = {
        id: Number(type === 'service' 
          ? responseData.serviceId || responseData.serviceId || responseData.id 
          : responseData.vetId || responseData.id),
        userId: responseData.userId || 0,
        firstName: responseData.firstName || '',
        lastName: responseData.lastName || '',
        experienceYears: responseData.experienceYears || 0,
        rating: responseData.ratingAverage || responseData.rating || 0,
        patientsCount: responseData.patientsCount || 0,
        avatarUrl: responseData.avatarUrl,
        about: responseData.about || responseData.description || '',
        address: responseData.address || '',
        clinicName: responseData.clinicName || responseData.businessName || '',
        phoneNumber: responseData.phoneNumber || '',
        education: responseData.education || '',
        specialty: type === 'service' ? responseData.serviceCategory : 'Veterinarian',
        serviceType: responseData.serviceType || '',
        pricePerVisit: responseData.pricePerVisit,
        city: responseData.city,
        licenseNumber: responseData.licenseNumber,
      };

      console.log('✅ Profile loaded:', {
        id: profileData.id,
        userId: profileData.userId,
        name: `${profileData.firstName} ${profileData.lastName}`,
      });
      
      setProfile(profileData);
      
      const isProfileOwner = currentUser?.id === profileData.userId;
      setIsOwner(isProfileOwner);
      
    } catch (error: any) {
      console.error('❌ Error loading profile:', error?.response?.status, error?.response?.data);
      
      if (error?.response?.status === 404) {
        setError('Профиль не найден');
      } else if (error?.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите заново');
      } else {
        setError(error?.response?.data?.message || error?.message || 'Не удалось загрузить профиль');
      }
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

  const handleProfileUpdate = () => {
    loadProfile();
    setTab('about');
  };

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
              console.error('❌ Delete error:', error?.response?.data);
              Alert.alert('Ошибка', error?.response?.data?.message || 'Не удалось удалить профиль');
            }
          },
        },
      ]
    );
  }, [type, router]);

  const shouldShowBookButton = useCallback(() => {
    if (!profile) return false;
    if (isOwner) return false;
    if (!id || id === 'me') return false;
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

  // Ошибка
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
        backgroundColor: colors.background.secondary,
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingTop: spacing.lg,
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
        {/* Верхняя часть */}
        <VetHeader
          vet={profile}
          type={type === 'service' ? 'service' : 'vet'}
        />
        
        <VetStats vet={profile} />

        <View style={{ height: spacing.md }} />

        <VetTabs
          active={tab}
          onChange={setTab}
          isOwner={isOwner}
        />

        {/* Контент вкладок */}
        <View style={{ marginTop: spacing.sm }}>
          {tab === 'about' && <VetAbout vet={profile} />}

          {tab === 'availability' && (
            <VetAvailability
              userId={profile.userId}  
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
              userId={profile.userId}  
              onDelete={handleDeleteProfile}
            />
          )}
        </View>
      </ScrollView>

      {/* Кнопка бронирования */}
      {shouldShowBookButton() && (
        <BookButton
          userId={profile.userId}  // ✅ передаем userId (41)
          specialistType={getSpecialistType()}
          specialistName={getSpecialistName()}
        />
      )}
    </View>
  );
}