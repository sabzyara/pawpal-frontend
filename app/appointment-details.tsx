import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppointmentDetails } from '@/hooks/useAppointments';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import { AppointmentStatus } from '@/types/appointment.types';
import NetInfo from '@react-native-community/netinfo';

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
  CONFIRMED: 'Подтверждена',
  COMPLETED: 'Завершена',
  CANCELLED_BY_USER: 'Отменена пользователем',
  CANCELLED_BY_SPECIALIST: 'Отменена специалистом',
  NO_SHOW: 'Неявка',
};

// Максимальная длина заметок (соответствует бэкенду @Column(length = 3000))
const MAX_NOTES_LENGTH = 3000;

export default function AppointmentDetailScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getUserRole } = useUser();
  
  const { 
    appointment, 
    loading, 
    recommendations, 
    refresh, 
    updateAppointment, 
    cancelAppointment 
  } = useAppointmentDetails(Number(id));
  
  const [userRole, setUserRole] = useState<string>('OWNER');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Заметки владельца
  const [isEditingOwnerNotes, setIsEditingOwnerNotes] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [savingOwnerNotes, setSavingOwnerNotes] = useState(false);
  
  // Заметки специалиста
  const [isEditingSpecialistNotes, setIsEditingSpecialistNotes] = useState(false);
  const [specialistNotes, setSpecialistNotes] = useState('');
  const [savingSpecialistNotes, setSavingSpecialistNotes] = useState(false);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, [getUserRole]);

  useEffect(() => {
    if (appointment?.ownerNotes) {
      setOwnerNotes(appointment.ownerNotes);
    }
    if (appointment?.specialistNotes) {
      setSpecialistNotes(appointment.specialistNotes);
    }
  }, [appointment?.ownerNotes, appointment?.specialistNotes]);

  // Проверка интернет-соединения
  const checkInternetConnection = useCallback(async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert('Ошибка', 'Нет подключения к интернету');
      return false;
    }
    return true;
  }, []);

  // Валидация длины заметок
  const validateNotesLength = useCallback((text: string, fieldName: string): boolean => {
    if (text.length > MAX_NOTES_LENGTH) {
      Alert.alert('Ошибка', `${fieldName} не могут превышать ${MAX_NOTES_LENGTH} символов`);
      return false;
    }
    return true;
  }, []);

  const handleCancel = async () => {
    if (!cancelAppointment) {
      Alert.alert('Ошибка', 'Функция отмены недоступна');
      return;
    }

    if (!cancelReason.trim()) {
      Alert.alert('Ошибка', 'Укажите причину отмены');
      return;
    }

    // Проверка интернета
    const isConnected = await checkInternetConnection();
    if (!isConnected) return;

    try {
      await cancelAppointment(appointment.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось отменить запись');
    }
  };

  const handleSaveOwnerNotes = async () => {
    if (!updateAppointment) {
      Alert.alert('Ошибка', 'Функция сохранения недоступна');
      return;
    }

    // Валидация длины
    if (!validateNotesLength(ownerNotes, 'Заметки')) return;

    // Проверка интернета
    const isConnected = await checkInternetConnection();
    if (!isConnected) return;

    setSavingOwnerNotes(true);
    try {
      await updateAppointment({ ownerNotes });
      setIsEditingOwnerNotes(false);
      Alert.alert('Успех', 'Заметки сохранены');
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось сохранить заметки');
    } finally {
      setSavingOwnerNotes(false);
    }
  };

  const handleSaveSpecialistNotes = async () => {
    if (!updateAppointment) {
      Alert.alert('Ошибка', 'Функция сохранения недоступна');
      return;
    }

    // Валидация длины
    if (!validateNotesLength(specialistNotes, 'Заметки специалиста')) return;

    // Проверка интернета
    const isConnected = await checkInternetConnection();
    if (!isConnected) return;

    setSavingSpecialistNotes(true);
    try {
      await updateAppointment({ specialistNotes });
      setIsEditingSpecialistNotes(false);
      Alert.alert('Успех', 'Заметки специалиста сохранены');
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось сохранить заметки специалиста');
    } finally {
      setSavingSpecialistNotes(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const isOwner = userRole === 'OWNER';
  const isSpecialist = userRole === 'VET' || userRole === 'SERVICE';
  const canCancel = appointment?.status === 'CREATED' || appointment?.status === 'CONFIRMED';
  const errorColor = colors.error?.main || '#F44336';

  // Показываем индикатор загрузки
  if (loading || !appointment) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing.md }}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.h2, { color: colors.text.primary }]}>
              Детали записи
            </Text>
            {appointment?.status && (
              <View
                style={{
                  backgroundColor: (statusColors[appointment.status as AppointmentStatus] || '#999') + '20',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: 20,
                }}
              >
                <Text style={{ 
                  color: statusColors[appointment.status as AppointmentStatus] || '#999', 
                  fontSize: 12 
                }}>
                  {statusLabels[appointment.status as AppointmentStatus] || appointment.status}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Specialist Info */}
        <View style={{
          backgroundColor: colors.card.default,
          borderRadius: spacing.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
            Специалист
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 25, 
              backgroundColor: colors.background.tertiary, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Ionicons name="person" size={24} color={colors.primary.main} />
            </View>
            <View>
              <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
                {appointment.specialistName || `Специалист #${appointment.specialistId}`}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {appointment.specialistType === 'VET' ? 'Ветеринар' : 'Специалист'}
              </Text>
            </View>
          </View>
        </View>

        {/* Pet Info */}
        <View style={{
          backgroundColor: colors.card.default,
          borderRadius: spacing.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
            Питомец
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 25, 
              backgroundColor: colors.background.tertiary, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Ionicons name="paw" size={24} color={colors.primary.main} />
            </View>
            <View>
              <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
                {appointment.petName || `Питомец #${appointment.petId}`}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {appointment.petType || 'Не указан'} {appointment.petBreed ? `• ${appointment.petBreed}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={{
          backgroundColor: colors.card.default,
          borderRadius: spacing.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
            Дата и время
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {new Date(appointment.date).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* Owner Notes */}
        <View style={{
          backgroundColor: colors.card.default,
          borderRadius: spacing.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {isOwner ? 'Ваши заметки' : 'Заметки клиента'}
            </Text>
            {isOwner && (
              <TouchableOpacity onPress={() => setIsEditingOwnerNotes(true)}>
                <Ionicons name="pencil" size={20} color={colors.primary.main} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[typography.body2, { color: colors.text.secondary }]}>
            {appointment.ownerNotes || 'Нет заметок'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs }]}>
            {appointment.ownerNotes?.length || 0}/{MAX_NOTES_LENGTH} символов
          </Text>
        </View>

        {/* Specialist Notes (only for specialist) */}
        {isSpecialist && (
          <View style={{
            backgroundColor: colors.card.default,
            borderRadius: spacing.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
                Ваши заметки (специалиста)
              </Text>
              <TouchableOpacity onPress={() => setIsEditingSpecialistNotes(true)}>
                <Ionicons name="pencil" size={20} color={colors.primary.main} />
              </TouchableOpacity>
            </View>
            <Text style={[typography.body2, { color: colors.text.secondary }]}>
              {appointment.specialistNotes || 'Нет заметок'}
            </Text>
            <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs }]}>
              {appointment.specialistNotes?.length || 0}/{MAX_NOTES_LENGTH} символов
            </Text>
          </View>
        )}

        {/* Recommendations */}
        {recommendations && (
          <View style={{
            backgroundColor: colors.primary.main + '10',
            borderRadius: spacing.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.primary.main,
          }}>
            <Text style={[typography.body1SemiBold, { color: colors.primary.main, marginBottom: spacing.sm }]}>
              Рекомендации
            </Text>
            <Text style={[typography.body2, { color: colors.text.primary }]}>
              {recommendations}
            </Text>
          </View>
        )}

        {/* Cancel Button */}
        {canCancel && cancelAppointment && (
          <TouchableOpacity
            onPress={() => setShowCancelModal(true)}
            style={{
              backgroundColor: errorColor,
              padding: spacing.md,
              borderRadius: spacing.sm,
              alignItems: 'center',
              marginTop: spacing.md,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Отменить запись</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal для редактирования заметок владельца */}
      <Modal visible={isEditingOwnerNotes} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.background.primary, 
            borderRadius: spacing.lg, 
            padding: spacing.lg, 
            width: '90%' 
          }}>
            <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
              {isOwner ? 'Редактировать заметки' : 'Заметки клиента'}
            </Text>
            <TextInput
              value={ownerNotes}
              onChangeText={setOwnerNotes}
              placeholder="Введите заметки"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              maxLength={MAX_NOTES_LENGTH}
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
            <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs, textAlign: 'right' }]}>
              {ownerNotes.length}/{MAX_NOTES_LENGTH}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity onPress={() => setIsEditingOwnerNotes(false)}>
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveOwnerNotes} disabled={savingOwnerNotes}>
                {savingOwnerNotes ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <Text style={[typography.body1SemiBold, { color: colors.primary.main }]}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal для редактирования заметок специалиста */}
      <Modal visible={isEditingSpecialistNotes} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.background.primary, 
            borderRadius: spacing.lg, 
            padding: spacing.lg, 
            width: '90%' 
          }}>
            <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
              Редактировать заметки специалиста
            </Text>
            <TextInput
              value={specialistNotes}
              onChangeText={setSpecialistNotes}
              placeholder="Введите заметки"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              maxLength={MAX_NOTES_LENGTH}
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
            <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs, textAlign: 'right' }]}>
              {specialistNotes.length}/{MAX_NOTES_LENGTH}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity onPress={() => setIsEditingSpecialistNotes(false)}>
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveSpecialistNotes} disabled={savingSpecialistNotes}>
                {savingSpecialistNotes ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <Text style={[typography.body1SemiBold, { color: colors.primary.main }]}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                <Text style={[typography.body1SemiBold, { color: errorColor }]}>Отменить запись</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}