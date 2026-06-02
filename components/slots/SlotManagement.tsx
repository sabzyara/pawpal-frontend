import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { timeSlotApi } from '@/services/appointmentApi';
import type { TimeSlot } from '@/services/appointmentApi';

interface SlotManagementProps {
  specialistId: number;
  specialistType: 'VET' | 'SERVICE';
}

export const SlotManagement: React.FC<SlotManagementProps> = ({
  specialistId,
  specialistType,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    loadSlots();
  }, [selectedDate, specialistId, specialistType]);

  // ✅ ИСПРАВЛЕНО:正确处理 пагинированного ответа
  const loadSlots = async () => {
    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const result = await timeSlotApi.getAvailableSlotsForDate(
        specialistId, 
        specialistType, 
        formattedDate
      );
      // ✅ result.content содержит массив TimeSlot
      setSlots(result.content || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить слоты');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedSlot || !blockReason.trim()) {
      Alert.alert('Ошибка', 'Укажите причину блокировки');
      return;
    }
    
    try {
      await timeSlotApi.blockSlot(selectedSlot.id, blockReason);
      await loadSlots();
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedSlot(null);
      Alert.alert('Успех', 'Слот заблокирован');
    } catch (error: any) {
      console.error('Error blocking slot:', error);
      Alert.alert('Ошибка', error?.message || 'Не удалось заблокировать слот');
    }
  };

  const handleUnblockSlot = async (slotId: number) => {
    try {
      await timeSlotApi.unblockSlot(slotId);
      await loadSlots();
      Alert.alert('Успех', 'Слот разблокирован');
    } catch (error: any) {
      console.error('Error unblocking slot:', error);
      Alert.alert('Ошибка', error?.message || 'Не удалось разблокировать слот');
    }
  };

  const handleRegenerateSlots = async () => {
    Alert.alert(
      'Подтверждение',
      'Это действие удалит все существующие слоты на выбранную дату и создаст новые. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Продолжить',
          onPress: async () => {
            try {
              setLoading(true);
              const formattedDate = selectedDate.toISOString().split('T')[0];
              await timeSlotApi.regenerateSlotsForDate(specialistId, formattedDate);
              await loadSlots();
              Alert.alert('Успех', 'Слоты успешно сгенерированы');
            } catch (error: any) {
              console.error('Error regenerating slots:', error);
              Alert.alert('Ошибка', error?.message || 'Не удалось сгенерировать слоты');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return colors.success?.main || colors.primary.main;
      case 'BOOKED':
        return colors.error?.main || colors.primary.main;
      case 'BLOCKED':
        return colors.warning?.main || colors.secondary.main;
      default:
        return colors.text.secondary;
    }
  };

  const getSlotStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Доступен';
      case 'BOOKED':
        return 'Забронирован';
      case 'BLOCKED':
        return 'Заблокирован';
      default:
        return status;
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: spacing.md }}>
        {/* Выбор даты */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
            backgroundColor: colors.card.default,
            borderRadius: spacing.md,
            padding: spacing.md,
          }}
        >
          <TouchableOpacity onPress={() => changeDate(-1)} style={{ padding: spacing.xs }}>
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => changeDate(1)} style={{ padding: spacing.xs }}>
            <Ionicons name="chevron-forward" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Кнопка регенерации */}
        <TouchableOpacity
          onPress={handleRegenerateSlots}
          style={{
            backgroundColor: colors.primary.main,
            padding: spacing.md,
            borderRadius: spacing.sm,
            alignItems: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Text style={[typography.button, { color: colors.text.inverse }]}>
            Сгенерировать слоты заново
          </Text>
        </TouchableOpacity>

        {/* Список слотов */}
        {loading ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : slots.length === 0 ? (
          <View
            style={{
              padding: spacing.xl,
              alignItems: 'center',
              backgroundColor: colors.background.tertiary,
              borderRadius: spacing.md,
            }}
          >
            <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
            <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md }]}>
              Нет слотов на эту дату
            </Text>
            <TouchableOpacity
              onPress={handleRegenerateSlots}
              style={{ marginTop: spacing.md }}
            >
              <Text style={{ color: colors.primary.main }}>Сгенерировать слоты</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {slots.map((slot) => (
              <View
                key={slot.id}
                style={{
                  backgroundColor: colors.card.default,
                  borderRadius: spacing.sm,
                  padding: spacing.sm,
                  minWidth: 100,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </Text>
                
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: spacing.xs,
                    gap: spacing.xs,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: getSlotStatusColor(slot.status),
                    }}
                  />
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {getSlotStatusText(slot.status)}
                  </Text>
                </View>

                {slot.status === 'AVAILABLE' && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSlot(slot);
                      setShowBlockModal(true);
                    }}
                    style={{
                      marginTop: spacing.xs,
                      paddingVertical: spacing.xs,
                      alignItems: 'center',
                      backgroundColor: colors.primary.light + '20',
                      borderRadius: spacing.xs,
                    }}
                  >
                    <Text style={{ color: colors.primary.main, fontSize: 12 }}>
                      Заблокировать
                    </Text>
                  </TouchableOpacity>
                )}

                {slot.status === 'BLOCKED' && (
                  <TouchableOpacity
                    onPress={() => handleUnblockSlot(slot.id)}
                    style={{
                      marginTop: spacing.xs,
                      paddingVertical: spacing.xs,
                      alignItems: 'center',
                      backgroundColor: colors.primary.light + '20',
                      borderRadius: spacing.xs,
                    }}
                  >
                    <Text style={{ color: colors.primary.main, fontSize: 12 }}>
                      Разблокировать
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Модальное окно для блокировки */}
        <Modal visible={showBlockModal} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: colors.background.primary,
                borderRadius: spacing.lg,
                padding: spacing.lg,
                width: '80%',
              }}
            >
              <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
                Причина блокировки
              </Text>
              <TextInput
                value={blockReason}
                onChangeText={setBlockReason}
                placeholder="Например: перерыв, больничный и т.д."
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
                <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                  <Text style={[typography.body1, { color: colors.text.secondary }]}>
                    Отмена
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBlockSlot}>
                  <Text style={[typography.body1SemiBold, { color: colors.primary.main }]}>
                    Заблокировать
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};