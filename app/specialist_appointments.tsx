import React, { useState } from 'react';
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
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSpecialistAppointments } from '@/hooks/useAppointments';
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
  CREATED: 'Ожидает',
  CONFIRMED: 'Подтверждено',
  COMPLETED: 'Завершено',
  CANCELLED_BY_USER: 'Отменено клиентом',
  CANCELLED_BY_SPECIALIST: 'Отменено вами',
  NO_SHOW: 'Неявка',
};

export default function SpecialistAppointmentsScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  
  const errorColor = colors.error?.main || '#F44336';
  const successColor = colors.success?.main || '#4CAF50';
  const warningColor = colors.warning?.main || '#FF9800';
  
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

  const navigateToAppointment = (appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  };

  const handleConfirm = (id: number) => {
    if (!confirmAppointment) {
      Alert.alert('Ошибка', 'Функция подтверждения недоступна');
      return;
    }
    Alert.alert('Подтверждение', 'Подтвердить запись?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Подтвердить', onPress: () => confirmAppointment(id) },
    ]);
  };

  const handleCancel = () => {
    if (!cancelBySpecialist) {
      Alert.alert('Ошибка', 'Функция отмены недоступна');
      return;
    }
    
    if (selectedAppointment && cancelReason.trim()) {
      cancelBySpecialist(selectedAppointment.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } else {
      Alert.alert('Ошибка', 'Укажите причину отмены');
    }
  };

  const handleComplete = (id: number) => {
    if (!completeAppointment) {
      Alert.alert('Ошибка', 'Функция завершения недоступна');
      return;
    }
    Alert.alert('Завершение', 'Завершить прием?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', onPress: () => completeAppointment(id) },
    ]);
  };

  const handleNoShow = (id: number) => {
    if (!markAsNoShow) {
      Alert.alert('Ошибка', 'Функция отметки неявки недоступна');
      return;
    }
    Alert.alert('Неявка', 'Отметить как неявку?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Да', onPress: () => markAsNoShow(id) },
    ]);
  };

  const handleAddRecommendations = async () => {
    if (!addRecommendations) {
      Alert.alert('Ошибка', 'Функция добавления рекомендаций недоступна');
      return;
    }
    
    if (selectedAppointment && recommendations.trim()) {
      await addRecommendations(selectedAppointment.id, { recommendations });
      setShowRecommendationsModal(false);
      setRecommendations('');
      setSelectedAppointment(null);
      Alert.alert('Успех', 'Рекомендации добавлены');
    } else {
      Alert.alert('Ошибка', 'Введите рекомендации');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Дата не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
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
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.md }}
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
        }}>
          Ожидают ({createdCount})
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
          borderRadius: spacing.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
          marginHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, flex: 1 }]}>
            {item.petOwnerName || 'Клиент'}
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

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm }}>
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
            Заметки клиента: {item.ownerNotes}
          </Text>
        )}

        {item.specialistNotes && (
          <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={2}>
            Ваши заметки: {item.specialistNotes}
          </Text>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm }}>
          {item.status === 'CREATED' && (
            <>
              <TouchableOpacity
                onPress={() => handleConfirm(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.xs,
                  alignItems: 'center',
                  backgroundColor: successColor,
                  borderRadius: spacing.xs,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '500' }}>Подтвердить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedAppointment(item);
                  setShowCancelModal(true);
                }}
                style={{
                  flex: 1,
                  paddingVertical: spacing.xs,
                  alignItems: 'center',
                  backgroundColor: errorColor,
                  borderRadius: spacing.xs,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '500' }}>Отменить</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'CONFIRMED' && (
            <>
              <TouchableOpacity
                onPress={() => handleComplete(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.xs,
                  alignItems: 'center',
                  backgroundColor: successColor,
                  borderRadius: spacing.xs,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '500' }}>Завершить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNoShow(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.xs,
                  alignItems: 'center',
                  backgroundColor: warningColor,
                  borderRadius: spacing.xs,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '500' }}>Неявка</Text>
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
                paddingVertical: spacing.xs,
                alignItems: 'center',
                backgroundColor: colors.primary.main,
                borderRadius: spacing.xs,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '500' }}>Добавить рекомендации</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={[typography.h2, { color: colors.text.primary }]}>Управление записями</Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          {createdCount} записей ожидают подтверждения
        </Text>
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
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
              <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md }]}>
                Нет записей
              </Text>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.background.primary, 
            borderRadius: spacing.lg, 
            padding: spacing.lg, 
            width: '80%' 
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
                <Text style={[typography.body1SemiBold, { color: errorColor }]}>Отменить</Text>
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
            backgroundColor: colors.background.primary, 
            borderRadius: spacing.lg, 
            padding: spacing.lg, 
            width: '80%' 
          }}>
            <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
              Рекомендации
            </Text>
            <TextInput
              value={recommendations}
              onChangeText={setRecommendations}
              placeholder="Введите рекомендации для владельца..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: spacing.sm,
                padding: spacing.sm,
                minHeight: 120,
                textAlignVertical: 'top',
                backgroundColor: colors.background.secondary,
                color: colors.text.primary,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity onPress={() => setShowRecommendationsModal(false)}>
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddRecommendations}>
                <Text style={[typography.body1SemiBold, { color: colors.primary.main }]}>Отправить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}