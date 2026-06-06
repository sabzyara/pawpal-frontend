// app/specialist-appointments.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSpecialistAppointments } from '@/hooks/useAppointments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppointmentStatus } from '@/types/appointment.types';

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: '#FF9800',
  CONFIRMED: '#2196F3',
  COMPLETED: '#10B981',
  CANCELLED_BY_USER: '#DC2626',
  CANCELLED_BY_SPECIALIST: '#DC2626',
  NO_SHOW: '#8A8A8A',
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED_BY_USER: 'Cancelled by Client',
  CANCELLED_BY_SPECIALIST: 'Cancelled by You',
  NO_SHOW: 'No Show',
};

export default function SpecialistAppointmentsScreen() {
  const { colors, typography, spacing, shadows } = useTheme();
  const router = useRouter();
  
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | undefined>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [recommendations, setRecommendations] = useState('');

  const {
    appointments = [],
    loading,
    refreshing,
    createdCount = 0,
    refresh,
    confirmAppointment,
    cancelBySpecialist,
    completeAppointment,
    markAsNoShow,
    addRecommendations,
  } = useSpecialistAppointments({ status: filterStatus });

  const navigateToAppointment = useCallback((appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  }, [router]);

  const handleConfirm = useCallback((id: number) => {
    if (!confirmAppointment) {
      Alert.alert('Ошибка', 'Функция подтверждения недоступна');
      return;
    }
    Alert.alert('Подтверждение', 'Подтвердить эту запись?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Подтвердить', onPress: () => confirmAppointment(id) },
    ]);
  }, [confirmAppointment]);

  const handleCancel = useCallback(async () => {
    if (!cancelBySpecialist) {
      Alert.alert('Ошибка', 'Функция отмены недоступна');
      return;
    }
    
    if (selectedAppointment && cancelReason.trim()) {
      try {
        await cancelBySpecialist(selectedAppointment.id, cancelReason);
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedAppointment(null);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось отменить запись');
      }
    } else {
      Alert.alert('Ошибка', 'Пожалуйста, укажите причину отмены');
    }
  }, [cancelBySpecialist, selectedAppointment, cancelReason]);

  const handleComplete = useCallback((id: number) => {
    if (!completeAppointment) {
      Alert.alert('Ошибка', 'Функция завершения недоступна');
      return;
    }
    Alert.alert('Завершение', 'Завершить эту запись?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', onPress: () => completeAppointment(id) },
    ]);
  }, [completeAppointment]);

  const handleNoShow = useCallback((id: number) => {
    if (!markAsNoShow) {
      Alert.alert('Ошибка', 'Функция отметки неявки недоступна');
      return;
    }
    Alert.alert('Неявка', 'Отметить как неявку?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', onPress: () => markAsNoShow(id) },
    ]);
  }, [markAsNoShow]);

  const handleAddRecommendations = useCallback(async () => {
    if (!addRecommendations) {
      Alert.alert('Ошибка', 'Функция добавления рекомендаций недоступна');
      return;
    }
    
    if (selectedAppointment && recommendations.trim()) {
      try {
        await addRecommendations(selectedAppointment.id, { recommendations });
        setShowRecommendationsModal(false);
        setRecommendations('');
        setSelectedAppointment(null);
        Alert.alert('Успех', 'Рекомендации добавлены');
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось добавить рекомендации');
      }
    } else {
      Alert.alert('Ошибка', 'Пожалуйста, введите рекомендации');
    }
  }, [addRecommendations, selectedAppointment, recommendations]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Дата не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Дата не указана';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const renderStatusFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingHorizontal: spacing.md, 
        gap: spacing.xs, 
        marginBottom: spacing.md 
      }}
    >
      <TouchableOpacity
        onPress={() => setFilterStatus(undefined)}
        style={{
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          borderRadius: 20,
          backgroundColor: !filterStatus ? colors.primary.main : colors.background.tertiary,
        }}
      >
        <Text style={{ 
          color: !filterStatus ? colors.text.inverse : colors.text.primary,
          fontWeight: !filterStatus ? '600' : '400',
          fontSize: 14,
        }}>
          Все ({appointments.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setFilterStatus('CREATED')}
        style={{
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          borderRadius: 20,
          backgroundColor: filterStatus === 'CREATED' ? colors.primary.main : colors.background.tertiary,
        }}
      >
        <Text style={{ 
          color: filterStatus === 'CREATED' ? colors.text.inverse : colors.text.primary,
          fontWeight: filterStatus === 'CREATED' ? '600' : '400',
          fontSize: 14,
        }}>
          Ожидает ({createdCount})
        </Text>
      </TouchableOpacity>
      {Object.entries(statusLabels).map(([key, label]) => {
        if (key === 'CREATED') return null;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => setFilterStatus(key as AppointmentStatus)}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
              borderRadius: 20,
              backgroundColor: filterStatus === key ? colors.primary.main : colors.background.tertiary,
            }}
          >
            <Text style={{ 
              color: filterStatus === key ? colors.text.inverse : colors.text.primary,
              fontWeight: filterStatus === key ? '600' : '400',
              fontSize: 14,
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderAppointmentCard = ({ item }: { item: any }) => {
    const statusColor = statusColors[item.status as AppointmentStatus] || colors.text.secondary;
    
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 24,
          padding: spacing.md,
          marginBottom: spacing.sm,
          marginHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
          ...shadows?.card,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: spacing.xs 
        }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, flex: 1 }]}>
            {item.petOwnerName || 'Клиент'}
          </Text>
          <View
            style={{
              backgroundColor: statusColor,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
              {statusLabels[item.status as AppointmentStatus] || item.status}
            </Text>
          </View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.md, 
          marginBottom: spacing.sm,
          flexWrap: 'wrap',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary.main} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="time-outline" size={16} color={colors.primary.main} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: spacing.xs,
          marginBottom: spacing.xs 
        }}>
          <Ionicons name="paw-outline" size={16} color={colors.primary.main} />
          <Text style={[typography.body2, { color: colors.text.primary }]}>
            Питомец: {item.petName || 'Не указан'} ({item.petType || 'Не указан'})
          </Text>
        </View>

        {item.ownerNotes && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            gap: spacing.xs,
            marginTop: spacing.xs,
          }}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary, flex: 1 }]} numberOfLines={2}>
              Заметки клиента: {item.ownerNotes}
            </Text>
          </View>
        )}

        {item.specialistNotes && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            gap: spacing.xs,
            marginTop: spacing.xs,
          }}>
            <Ionicons name="medical-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary, flex: 1 }]} numberOfLines={2}>
              Ваши заметки: {item.specialistNotes}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md }}>
          {item.status === 'CREATED' && (
            <>
              <TouchableOpacity
                onPress={() => handleConfirm(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  backgroundColor: colors.success?.main || '#10B981',
                  borderRadius: 12,
                  ...shadows?.light,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Подтвердить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedAppointment(item);
                  setShowCancelModal(true);
                }}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  backgroundColor: colors.error?.main || '#DC2626',
                  borderRadius: 12,
                  ...shadows?.light,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Отменить</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'CONFIRMED' && (
            <>
              <TouchableOpacity
                onPress={() => handleComplete(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  backgroundColor: colors.success?.main || '#10B981',
                  borderRadius: 12,
                  ...shadows?.light,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Завершить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNoShow(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                  backgroundColor: colors.warning?.main || '#F59E0B',
                  borderRadius: 12,
                  ...shadows?.light,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Неявка</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'COMPLETED' && addRecommendations && (
            <TouchableOpacity
              onPress={() => {
                setSelectedAppointment(item);
                setShowRecommendationsModal(true);
              }}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                alignItems: 'center',
                backgroundColor: colors.primary.main,
                borderRadius: 12,
                ...shadows?.button,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Добавить рекомендации</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Показываем индикатор загрузки
  if (loading && !refreshing && appointments.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  const showEmpty = !loading && !refreshing && appointments.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <View
        style={{
          margin: spacing.md,
          marginTop: 60,
          marginBottom: spacing.md,
          padding: spacing.lg,
          borderRadius: 28,
          backgroundColor: colors.primary.main,
          ...shadows?.dark,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 34, marginRight: spacing.sm }}>📅</Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: colors.text.inverse,
              flex: 1,
            }}
          >
            Записи
          </Text>
        </View>

        <Text
          style={{
            color: colors.text.inverse,
            opacity: 0.9,
            marginTop: 4,
            fontSize: 14,
          }}
        >
          Управление предстоящими визитами
        </Text>
        
        {createdCount > 0 && (
          <View
            style={{
              marginTop: spacing.md,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: colors.text.inverse, fontSize: 13, fontWeight: '600' }}>
              {createdCount} ожидающих {createdCount === 1 ? 'запись' : 'записей'}
            </Text>
          </View>
        )}
      </View>

      {renderStatusFilter()}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointmentCard}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        ListEmptyComponent={
          showEmpty ? (
            <View style={{ 
              padding: spacing.xl, 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginTop: 60 
            }}>
              <Ionicons
                name="calendar-clear-outline"
                size={72}
                color={colors.primary.light}
              />
              <Text
                style={[
                  typography.h4,
                  {
                    color: colors.text.primary,
                    marginTop: spacing.md,
                  },
                ]}
              >
                Нет записей
              </Text>
              <Text
                style={[
                  typography.body2,
                  {
                    color: colors.text.secondary,
                    textAlign: 'center',
                    marginTop: spacing.xs,
                  },
                ]}
              >
                Новые записи появятся здесь
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={appointments.length === 0 ? { flex: 1 } : undefined}
      />

      {/* Cancel Modal */}
      <Modal 
        visible={showCancelModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.card.default, 
            borderRadius: 24, 
            padding: spacing.lg, 
            width: '85%',
            ...shadows?.modal,
          }}>
            <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
              Причина отмены
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Укажите причину отмены"
              placeholderTextColor={colors.text.tertiary}
              multiline
              style={{
                borderWidth: 1,
                borderColor: colors.border.medium,
                borderRadius: 16,
                padding: spacing.sm,
                minHeight: 100,
                textAlignVertical: 'top',
                backgroundColor: colors.input?.background || colors.background.secondary,
                color: colors.text.primary,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity 
                onPress={() => setShowCancelModal(false)}
                style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.md }}
              >
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCancel}
                style={{ 
                  paddingVertical: spacing.xs, 
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.error?.main || '#DC2626',
                  borderRadius: 12,
                  ...shadows?.light,
                }}
              >
                <Text style={[typography.body1SemiBold, { color: '#FFF' }]}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recommendations Modal */}
      <Modal 
        visible={showRecommendationsModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowRecommendationsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.card.default, 
            borderRadius: 24, 
            padding: spacing.lg, 
            width: '85%',
            ...shadows?.modal,
          }}>
            <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
              Добавить рекомендации
            </Text>
            <TextInput
              value={recommendations}
              onChangeText={setRecommendations}
              placeholder="Введите рекомендации для владельца питомца..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              style={{
                borderWidth: 1,
                borderColor: colors.border.medium,
                borderRadius: 16,
                padding: spacing.sm,
                minHeight: 140,
                textAlignVertical: 'top',
                backgroundColor: colors.input?.background || colors.background.secondary,
                color: colors.text.primary,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity 
                onPress={() => setShowRecommendationsModal(false)}
                style={{ paddingVertical: spacing.xs, paddingHorizontal: spacing.md }}
              >
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddRecommendations}
                style={{ 
                  paddingVertical: spacing.xs, 
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.primary.main,
                  borderRadius: 12,
                  ...shadows?.button,
                }}
              >
                <Text style={[typography.body1SemiBold, { color: '#FFF' }]}>Отправить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}