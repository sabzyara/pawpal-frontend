import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useOwnerAppointments } from '@/hooks/useAppointments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppointmentStatus } from '@/types/appointment.types';

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: '#FF9800',
  CONFIRMED: '#2196F3',
  COMPLETED: '#4CAF50',
  CANCELLED_BY_USER: '#F44336',
  CANCELLED_BY_SPECIALIST: '#F44336',
  NO_SHOW: '#9E9E9E',
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждено',
  COMPLETED: 'Завершено',
  CANCELLED_BY_USER: 'Отменено вами',
  CANCELLED_BY_SPECIALIST: 'Отменено специалистом',
  NO_SHOW: 'Неявка',
};

export default function MyAppointmentsScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | undefined>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    appointments = [], // ✅ Значение по умолчанию - пустой массив
    loading,
    refreshing,
    hasMore,
    loadMore,
    refresh,
    cancelAppointment,
  } = useOwnerAppointments({ status: selectedStatus });

  const handleCancel = () => {
    if (!cancelAppointment) {
      Alert.alert('Ошибка', 'Функция отмены недоступна');
      return;
    }

    if (selectedAppointmentId && cancelReason.trim()) {
      cancelAppointment(selectedAppointmentId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointmentId(null);
    } else {
      Alert.alert('Ошибка', 'Укажите причину отмены');
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Дата не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
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

  const renderStatusFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.md }}
    >
      <TouchableOpacity
        onPress={() => setSelectedStatus(undefined)}
        style={{
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          borderRadius: 20,
          backgroundColor: !selectedStatus ? colors.primary.main : colors.background.tertiary,
        }}
      >
        <Text style={{ 
          color: !selectedStatus ? colors.text.inverse : colors.text.primary,
          fontWeight: !selectedStatus ? '600' : '400',
        }}>
          Все
        </Text>
      </TouchableOpacity>
      {Object.entries(statusLabels).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          onPress={() => setSelectedStatus(key as AppointmentStatus)}
          style={{
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: 20,
            backgroundColor: selectedStatus === key ? colors.primary.main : colors.background.tertiary,
          }}
        >
          <Text style={{ 
            color: selectedStatus === key ? colors.text.inverse : colors.text.primary,
            fontWeight: selectedStatus === key ? '600' : '400',
          }}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAppointmentCard = ({ item }: { item: any }) => {
    const canCancel = (item.status === 'CREATED' || item.status === 'CONFIRMED') && cancelAppointment;
    const statusColor = statusColors[item.status as AppointmentStatus] || colors.text.secondary;
    const errorColor = colors.error?.main || '#F44336';
    
    return (
      <TouchableOpacity
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card.default,
          borderRadius: spacing.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          marginHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: spacing.xs 
        }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, flex: 1 }]}>
            {item.specialistName || 'Специалист'}
          </Text>
          <View
            style={{
              backgroundColor: statusColor + '20',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: spacing.sm,
            }}
          >
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: '500' }}>
              {statusLabels[item.status as AppointmentStatus] || item.status}
            </Text>
          </View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.md, 
          marginBottom: spacing.sm 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>

        <Text style={[typography.body2, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Питомец: {item.petName || 'Не указан'} ({item.petType || 'Не указан'})
        </Text>

        {item.ownerNotes && (
          <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={2}>
            Заметки: {item.ownerNotes}
          </Text>
        )}

        {canCancel && (
          <TouchableOpacity
            onPress={() => {
              setSelectedAppointmentId(item.id);
              setShowCancelModal(true);
            }}
            style={{
              marginTop: spacing.sm,
              paddingVertical: spacing.xs,
              alignItems: 'center',
              backgroundColor: errorColor + '20',
              borderRadius: spacing.xs,
            }}
          >
            <Text style={{ color: errorColor, fontSize: 14, fontWeight: '500' }}>
              Отменить запись
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const showFooter = loading && !refreshing;
  const showEmpty = !loading && !refreshing && appointments.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <View style={{
        paddingTop: 60,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
      }}>
        <Text style={[typography.h2, { color: colors.text.primary }]}>Мои записи</Text>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={appointments}  // ✅ Теперь appointments всегда массив (благодаря значению по умолчанию)
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
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          showFooter ? (
            <View style={{ padding: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          showEmpty ? (
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
              <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md }]}>
                У вас нет записей
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/')}
                style={{ 
                  marginTop: spacing.md, 
                  backgroundColor: colors.primary.main, 
                  paddingHorizontal: spacing.lg, 
                  paddingVertical: spacing.sm, 
                  borderRadius: 20 
                }}
              >
                <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>Записаться</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* Cancel Modal */}
      <Modal 
        visible={showCancelModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: colors.background.primary,
            borderRadius: spacing.lg,
            padding: spacing.lg,
            width: '80%',
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
                borderColor: colors.border.light,
                borderRadius: spacing.sm,
                padding: spacing.sm,
                minHeight: 80,
                textAlignVertical: 'top',
                backgroundColor: colors.background.secondary,
                color: colors.text.primary,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={[typography.body1SemiBold, { color: colors.error?.main || '#F44336' }]}>
                  Отменить запись
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}