// app/(specialist)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { HomeHeader } from '@/components/home/Header';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// ✅ Временный хук для записей (если нет готового)
const useSpecialistAppointments = ({ status }: { status?: string }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  const refresh = async () => {
    setRefreshing(true);
    // Здесь должен быть реальный API запрос
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const confirmAppointment = async (id: number) => {
    console.log('Confirm appointment:', id);
  };

  const completeAppointment = async (id: number) => {
    console.log('Complete appointment:', id);
  };

  useEffect(() => {
    // Загрузка записей
    refresh();
  }, []);

  return {
    appointments,
    loading,
    refreshing,
    refresh,
    createdCount,
    confirmAppointment,
    completeAppointment,
  };
};

export default function SpecialistHomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { profile, fetchProfile } = useProfileStore();

  const [specialistInfo, setSpecialistInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const {
    appointments = [],
    loading: appointmentsLoading,
    refreshing,
    refresh,
    createdCount = 0,
    confirmAppointment,
    completeAppointment,
  } = useSpecialistAppointments({ status: undefined });

  useEffect(() => {
    if (user) {
      fetchProfile(user);
      loadSpecialistInfo();
    }
  }, [user]);

  const loadSpecialistInfo = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Здесь должен быть реальный API запрос
      // const info = await specialistService.getSpecialistByUserId(user.id);
      // setSpecialistInfo(info);
      setSpecialistInfo({});
    } catch (error) {
      console.error('Error loading specialist info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (profile?.veterinarian?.firstName) {
      return `Dr. ${profile.veterinarian.firstName} ${profile.veterinarian.lastName}`;
    }
    if (profile?.serviceProvider?.firstName) {
      return `${profile.serviceProvider.firstName} ${profile.serviceProvider.lastName}`;
    }
    return profile?.user?.email?.split('@')[0] || 'Specialist';
  };

  const getSpecialistTypeLabel = () => {
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

  const handleRefresh = () => {
    refresh();
    if (user) {
      fetchProfile(user);
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

  const renderAppointmentCard = ({ item }: { item: any }) => {
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

    const statusColor = statusColors[item.status] || colors.text.secondary;

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
          <View>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {item.petOwnerName || 'Клиент'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              🐾 {item.petName || 'Питомец'}
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

        {item.status === 'CREATED' && (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <TouchableOpacity
              onPress={() => confirmAppointment?.(item.id)}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                alignItems: 'center',
                backgroundColor: colors.success.main,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Подтвердить</Text>
            </TouchableOpacity>
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
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary }}>
        <Text style={{ color: colors.text.secondary }}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <HomeHeader
        greeting="Здравствуйте"
        userName={getDisplayName()}
        avatarUrl={profile?.veterinarian?.avatarUrl || profile?.serviceProvider?.avatarUrl || null}
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

          {/* Welcome Card */}
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

          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <View
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
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.card.default,
                borderRadius: 20,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={{ fontSize: 32, fontWeight: '700', color: colors.success.main }}>
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                Завершенных приемов
              </Text>
            </View>
          </View>

          {/* Recent Appointments */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.h4, { color: colors.text.primary }]}>
                Последние записи
              </Text>
              <TouchableOpacity onPress={navigateToAllAppointments}>
                <Text style={{ color: colors.primary.main, fontSize: 14 }}>Все →</Text>
              </TouchableOpacity>
            </View>

            {appointmentsLoading ? (
              <Text style={{ color: colors.text.secondary, textAlign: 'center', padding: spacing.xl }}>
                Загрузка...
              </Text>
            ) : appointments.length === 0 ? (
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
