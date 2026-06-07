// app/(specialist)/index.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { HomeHeader } from '@/components/home/Header';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { appointmentApi, specialistService } from '@/services/appointmentApi';
import type { AppointmentResponseDto, SpecialistInfo } from '@/services/appointmentApi';


interface DisplayAppointment {
  id: number;
  status: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  petOwnerId?: number;
  petId?: number;
  displayPetOwnerName: string;
  displayPetName: string;
  original: AppointmentResponseDto;
}

export default function SpecialistHomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { profile, fetchProfile } = useProfileStore();

  const [specialistInfo, setSpecialistInfo] = useState<SpecialistInfo | null>(null);
  const [appointments, setAppointments] = useState<DisplayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);


  const loadSpecialistInfo = useCallback(async () => {
    if (!user?.id || !token) return;
    
    try {
      const info = await specialistService.getSpecialistByUserId(user.id);
      setSpecialistInfo(info);
      return info;
    } catch (error) {
      console.error('Error loading specialist info:', error);
      return null;
    }
  }, [user?.id, token]);


  const loadAppointments = useCallback(async () => {
    if (!token) return;

    try {
      const response = await appointmentApi.getSpecialistAppointments({
        page: 0,
        size: 50,
      });
      
      const content = response.content || [];
      

      const displayAppointments: DisplayAppointment[] = content.map((apt: AppointmentResponseDto) => ({
        id: apt.id,
        status: apt.status,
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        petOwnerId: apt.petOwnerId,
        petId: apt.petId,
        displayPetOwnerName: apt.petOwnerName || `Клиент #${apt.petOwnerId}`,
        displayPetName: apt.petName || 'Питомец',
        original: apt,
      }));
      
      setAppointments(displayAppointments);
 
      const created = content.filter((apt: AppointmentResponseDto) => apt.status === 'CREATED').length;
      setCreatedCount(created);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      if (error?.status === 403) {
        console.log('Access denied to appointments');
      }
      setAppointments([]);
      setCreatedCount(0);
    }
  }, [token]);


  const loadData = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadSpecialistInfo(),
        loadAppointments(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, loadSpecialistInfo, loadAppointments]);


  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    if (user) {
      await fetchProfile(user);
    }
    setRefreshing(false);
  }, [loadData, user, fetchProfile]);


  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getDisplayName = () => {
    if (specialistInfo) {
      return `${specialistInfo.firstName} ${specialistInfo.lastName}`.trim();
    }
    if (profile?.veterinarian?.firstName) {
      return `Dr. ${profile.veterinarian.firstName} ${profile.veterinarian.lastName}`;
    }
    if (profile?.serviceProvider?.firstName) {
      return `${profile.serviceProvider.firstName} ${profile.serviceProvider.lastName}`;
    }
    return profile?.user?.email?.split('@')[0] || 'Специалист';
  };

  const getSpecialistTypeLabel = () => {
    if (specialistInfo?.specialistType === 'VET') return 'Ветеринар';
    if (specialistInfo?.specialistType === 'SERVICE') return 'Сервис-провайдер';
    if (profile?.veterinarian) return 'Ветеринар';
    if (profile?.serviceProvider) return 'Сервис-провайдер';
    return 'Специалист';
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Дата не указана';
    try {
      return format(new Date(dateString), 'd MMMM', { locale: ru });
    } catch {
      return 'Дата не указана';
    }
  };

  const navigateToAppointment = (appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  };

  const navigateToProfile = () => {
    router.push({
      pathname: '/specialist-profile',
    });
  };

  const navigateToAllAppointments = () => {
    router.push({
      pathname: '/specialist_appointments'
    });
  };

  const handleConfirmAppointment = async (id: number) => {
    try {
      await appointmentApi.confirmAppointment(id);
      Alert.alert('Успех', 'Запись подтверждена');
      await loadAppointments();
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось подтвердить запись');
    }
  };


  const handleCancelBySpecialist = async (id: number) => {
    Alert.alert(
      'Отмена записи',
      'Укажите причину отмены',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отменить',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentApi.cancelAppointment(id, 'Отменено специалистом');
              Alert.alert('Успех', 'Запись отменена');
              await loadAppointments();
            } catch (error: any) {
              Alert.alert('Ошибка', error?.message || 'Не удалось отменить запись');
            }
          }
        }
      ]
    );
  };

  const statusColors: Record<string, string> = {
    CREATED: '#FF9800',
    CONFIRMED: '#2196F3',
    COMPLETED: '#4CAF50',
    CANCELLED_BY_USER: '#F44336',
    CANCELLED_BY_SPECIALIST: '#F44336',
    NO_SHOW: '#9E9E9E',
  };

  const statusLabels: Record<string, string> = {
    CREATED: 'Ожидает',
    CONFIRMED: 'Подтвержден',
    COMPLETED: 'Завершен',
    CANCELLED_BY_USER: 'Отменен клиентом',
    CANCELLED_BY_SPECIALIST: 'Отменен вами',
    NO_SHOW: 'Не явка',
  };

  const renderAppointmentCard = ({ item }: { item: DisplayAppointment }) => {
    const statusColor = statusColors[item.status] || colors.text.secondary;
    const isCreated = item.status === 'CREATED';
    const isConfirmed = item.status === 'CONFIRMED';

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 20,
          padding: spacing.md,
          marginBottom: spacing.sm,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {item.displayPetOwnerName}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              🐾 {item.displayPetName}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: statusColor + '20',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: '600' }}>
              {statusLabels[item.status] || item.status}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>

        {(isCreated || isConfirmed) && (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            {isCreated && (
              <TouchableOpacity
                onPress={() => handleConfirmAppointment(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  backgroundColor: colors.success?.main || '#4CAF50',
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Подтвердить</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => navigateToAppointment(item.id)}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                alignItems: 'center',
                backgroundColor: colors.background.tertiary,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={{ color: colors.text.primary, fontSize: 13 }}>Подробнее</Text>
            </TouchableOpacity>
            {isCreated && (
              <TouchableOpacity
                onPress={() => handleCancelBySpecialist(item.id)}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  alignItems: 'center',
                  backgroundColor: colors.error?.main || '#F44336',
                  borderRadius: 12,
                }}
              >
                <Ionicons name="close-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };


  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.text.tertiary} />
          <Text style={[typography.h4, { color: colors.text.primary, marginTop: spacing.md }]}>
            Требуется авторизация
          </Text>
          <Text style={[typography.body2, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm }]}>
            Пожалуйста, войдите в аккаунт
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary }}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <HomeHeader
        greeting="Здравствуйте"
        userName={getDisplayName()}
        avatarUrl={specialistInfo?.avatarUrl || profile?.veterinarian?.avatarUrl || profile?.serviceProvider?.avatarUrl || null}
        notificationCount={0}
        onNotificationPress={() => router.push('/notifications')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        <View style={{ padding: spacing.md }}>


          <View
            style={{
              backgroundColor: colors.primary.main,
              borderRadius: 24,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ color: colors.text.inverse, fontSize: 14, opacity: 0.9 }}>
              {getSpecialistTypeLabel()}
            </Text>
            <Text style={{ color: colors.text.inverse, fontSize: 28, fontWeight: '700', marginTop: 4 }}>
              {getDisplayName()}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.md, gap: spacing.md }}>
              <TouchableOpacity
                onPress={navigateToProfile}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: colors.text.inverse }}>📅 Управление</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={navigateToAllAppointments}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: colors.text.inverse }}>📋 Все записи</Text>
              </TouchableOpacity>
            </View>
          </View>


          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <TouchableOpacity
              onPress={() => router.push('/specialist_appointments?status=CREATED')}
              style={{
                flex: 1,
                backgroundColor: colors.card.default,
                borderRadius: 20,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary.main }}>
                {createdCount}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Ожидают подтверждения
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/specialist_appointments?status=COMPLETED')}
              style={{
                flex: 1,
                backgroundColor: colors.card.default,
                borderRadius: 20,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.success?.main || '#4CAF50' }}>
                {completedCount}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Завершенных приемов
              </Text>
            </TouchableOpacity>
          </View>


          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.h4, { color: colors.text.primary }]}>
                Последние записи
              </Text>
              <TouchableOpacity onPress={navigateToAllAppointments}>
                <Text style={{ color: colors.primary.main, fontSize: 14 }}>Все →</Text>
              </TouchableOpacity>
            </View>

            {appointments.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.card.default,
                  borderRadius: 20,
                  padding: spacing.xl,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Ionicons name="calendar-outline" size={48} color={colors.text.tertiary} />
                <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.md }]}>
                  Нет записей
                </Text>
                <Text style={[typography.caption, { color: colors.text.tertiary }]}>
                  Новые записи появятся здесь
                </Text>
              </View>
            ) : (
              <FlatList
                data={appointments.slice(0, 5)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAppointmentCard}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}