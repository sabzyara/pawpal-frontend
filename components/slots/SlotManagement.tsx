// components/slots/SlotManagement.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { timeSlotApi, specialistService } from '@/services/appointmentApi';
import type { TimeSlot } from '@/services/appointmentApi';

interface SlotManagementProps {
  userId: number;
  specialistType?: 'VET' | 'SERVICE';
  isOwner?: boolean;
}

export const SlotManagement: React.FC<SlotManagementProps> = ({
  userId,
  specialistType: propSpecialistType,
  isOwner = false,
}) => {
  const { colors, typography, spacing } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [specialistInfo, setSpecialistInfo] = useState<{ specialistId: number; specialistType: string } | null>(null);
  const [loadingSpecialist, setLoadingSpecialist] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  
  // ✅ Для отмены запросов
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadSpecialistInfo();
    
    // ✅ Очистка при размонтировании
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (specialistInfo) {
      loadSlots();
    }
    
    // ✅ Отменяем предыдущий запрос при смене даты
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [selectedDate, specialistInfo]);

  const loadSpecialistInfo = async () => {
    try {
      setLoadingSpecialist(true);
      const info = await specialistService.getSpecialistByUserId(userId);
      setSpecialistInfo({
        specialistId: info.specialistId,
        specialistType: info.specialistType,
      });
    } catch (error) {
      console.error('Error loading specialist info:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось найти профиль специалиста. Убедитесь, что пользователь является специалистом.'
      );
    } finally {
      setLoadingSpecialist(false);
    }
  };

  const loadSlots = async () => {
    if (!specialistInfo) return;
    
    // ✅ Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const slotsData = await timeSlotApi.getSlotsByDate(
        specialistInfo.specialistId,
        specialistInfo.specialistType as 'VET' | 'SERVICE',
        formattedDate
      );
      
      // ✅ Сортируем слоты по времени
      const sortedSlots = (slotsData || []).sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );
      
      setSlots(sortedSlots);
    } catch (error: any) {
      // ✅ Игнорируем ошибки отмены
      if (error?.name === 'AbortError' || error?.message === 'canceled') {
        return;
      }
      
      console.error('Error loading slots:', error);
      
      try {
  const formattedDate = selectedDate.toISOString().split('T')[0];
  const result = await timeSlotApi.getAvailableSlotsByUserId(userId, formattedDate);
  const sortedSlots = (result.slots?.content || []).sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
  setSlots(sortedSlots);
} catch (fallbackError: any) {
  if (fallbackError?.name !== 'AbortError') {
    console.error('Fallback error:', fallbackError);
  }
}
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    Alert.alert(
      'Подтверждение',
      'Разблокировать этот слот?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Разблокировать',
          onPress: async () => {
            try {
              await timeSlotApi.unblockSlot(slotId);
              await loadSlots();
              Alert.alert('Успех', 'Слот разблокирован');
            } catch (error: any) {
              console.error('Error unblocking slot:', error);
              Alert.alert('Ошибка', error?.message || 'Не удалось разблокировать слот');
            }
          },
        },
      ]
    );
  };

  const handleRegenerateSlots = async () => {
    if (!specialistInfo) return;
    
    // Проверка, что дата не прошедшая
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      Alert.alert('Ошибка', 'Нельзя генерировать слоты на прошедшие даты');
      return;
    }
    
    Alert.alert(
      'Подтверждение',
      'Это действие удалит все существующие слоты на выбранную дату и создаст новые. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Продолжить',
          onPress: async () => {
            try {
              setRegenerating(true);
              const formattedDate = selectedDate.toISOString().split('T')[0];
              
              await timeSlotApi.regenerateSlotsByUserId(userId, formattedDate);
              await loadSlots();
              Alert.alert('Успех', 'Слоты успешно сгенерированы');
            } catch (error: any) {
              console.error('Error regenerating slots:', error);
              Alert.alert('Ошибка', error?.message || 'Не удалось сгенерировать слоты');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadSlots();
  }, [selectedDate, specialistInfo]);

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

  // ✅ Улучшенные функции цветов с fallback значениями
  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#4CAF50'; // ✅ Явное значение вместо colors.success
      case 'BOOKED':
        return '#F44336';
      case 'BLOCKED':
        return '#FF9800';
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

  // ✅ Проверка, прошедший ли слот
  const isSlotPast = (slot: TimeSlot) => {
    const [hours, minutes] = slot.startTime.split(':');
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return slotDateTime < new Date();
  };

  if (loadingSpecialist) {
    return (
      <View style={{ padding: spacing.xl, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.md }]}>
          Загрузка информации о специалисте...
        </Text>
      </View>
    );
  }

  if (!specialistInfo) {
    return (
      <View style={{ 
        padding: spacing.xl, 
        alignItems: 'center', 
        backgroundColor: colors.background.tertiary, 
        borderRadius: spacing.md 
      }}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]}>
          Специалист не найден
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          Убедитесь, что пользователь является ветеринаром или сервис-провайдером
        </Text>
      </View>
    );
  }

  return (
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
        {/* Информация о специалисте */}
        <View style={{ 
          backgroundColor: colors.card.default, 
          borderRadius: spacing.md, 
          padding: spacing.md, 
          marginBottom: spacing.md, 
          borderWidth: 1, 
          borderColor: colors.border.light 
        }}>
          <Text style={[typography.body2, { color: colors.text.secondary }]}>
            Тип специалиста: {specialistInfo.specialistType === 'VET' ? 'Ветеринар' : 'Сервис-провайдер'}
          </Text>
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs }]}>
            ID специалиста: {specialistInfo.specialistId}
          </Text>
        </View>

        {/* Выбор даты */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: spacing.lg, 
          backgroundColor: colors.card.default, 
          borderRadius: spacing.md, 
          padding: spacing.md, 
          borderWidth: 1, 
          borderColor: colors.border.light 
        }}>
          <TouchableOpacity 
            onPress={() => changeDate(-1)} 
            style={{ padding: spacing.xs }}
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => changeDate(1)} 
            style={{ padding: spacing.xs }}
            disabled={loading}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Кнопка регенерации - ТОЛЬКО ДЛЯ ВЛАДЕЛЬЦА */}
        {isOwner && (
          <TouchableOpacity
            onPress={handleRegenerateSlots}
            disabled={regenerating || loading}
            style={{ 
              backgroundColor: colors.primary.main, 
              padding: spacing.md, 
              borderRadius: spacing.sm, 
              alignItems: 'center', 
              marginBottom: spacing.md,
              opacity: (regenerating || loading) ? 0.7 : 1
            }}
          >
            {regenerating ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={[typography.button, { color: colors.text.inverse }]}>
                Сгенерировать слоты заново
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Список слотов */}
        {loading ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : slots.length === 0 ? (
          <View style={{ 
            padding: spacing.xl, 
            alignItems: 'center', 
            backgroundColor: colors.background.tertiary, 
            borderRadius: spacing.md 
          }}>
            <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
            <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md }]}>
              Нет слотов на эту дату
            </Text>
            {isOwner && (
              <TouchableOpacity 
                onPress={handleRegenerateSlots} 
                style={{ marginTop: spacing.md }}
                disabled={regenerating}
              >
                <Text style={{ color: colors.primary.main }}>Сгенерировать слоты</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
  {slots.map((slot) => {
    const isPast = isSlotPast(slot);
    const isBooked = slot.status === 'BOOKED';
    const isBlocked = slot.status === 'BLOCKED';
    const isAvailable = slot.status === 'AVAILABLE';
    
    return (
      <View 
        key={slot.id} 
        style={{ 
          backgroundColor: colors.card.default, 
          borderRadius: spacing.sm, 
          padding: spacing.sm, 
          minWidth: 100, 
          borderWidth: 1, 
          borderColor: colors.border.light,
          opacity: (isBooked || isPast) ? 0.6 : 1,
        }}
      >
        <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </Text>
        
        {/* Индикатор прошедшего времени */}
        {isPast && !isBooked && (
          <View style={{ marginTop: spacing.xs }}>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>
              ⏰ Прошедший слот
            </Text>
          </View>
        )}
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.xs }}>
          <View style={{ 
            width: 8, 
            height: 8, 
            borderRadius: 4, 
            backgroundColor: getSlotStatusColor(slot.status) 
          }} />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {getSlotStatusText(slot.status)}
          </Text>
        </View>

        {/* Кнопка блокировки - ТОЛЬКО ДЛЯ ВЛАДЕЛЬЦА и ТОЛЬКО ДЛЯ ДОСТУПНЫХ слотов */}
        {isOwner && isAvailable && !isPast && (
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
              borderRadius: spacing.xs 
            }}
          >
            <Text style={{ color: colors.primary.main, fontSize: 12 }}>
              Заблокировать
            </Text>
          </TouchableOpacity>
        )}

        {/* Кнопка разблокировки - ТОЛЬКО ДЛЯ ВЛАДЕЛЬЦА и ТОЛЬКО ДЛЯ ЗАБЛОКИРОВАННЫХ слотов */}
        {isOwner && isBlocked && !isPast && (
          <TouchableOpacity 
            onPress={() => handleUnblockSlot(slot.id)} 
            style={{ 
              marginTop: spacing.xs, 
              paddingVertical: spacing.xs, 
              alignItems: 'center', 
              backgroundColor: colors.primary.light + '20', 
              borderRadius: spacing.xs 
            }}
          >
            <Text style={{ color: colors.primary.main, fontSize: 12 }}>
              Разблокировать
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Индикатор, что прошедший слот нельзя модифицировать */}
        {isPast && (isAvailable || isBlocked) && (
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs, textAlign: 'center' }]}>
            Недоступен для изменений
          </Text>
        )}
      </View>
    );
  })}
</View>
        )}

        {/* Модальное окно для блокировки */}
        <Modal 
          visible={showBlockModal} 
          transparent 
          animationType="fade"
          onRequestClose={() => setShowBlockModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: colors.background.primary, 
              borderRadius: spacing.lg, 
              padding: spacing.lg, 
              width: '80%' 
            }}>
              <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
                Причина блокировки
              </Text>
              
              <TextInput
                value={blockReason}
                onChangeText={setBlockReason}
                placeholder="Например: перерыв, больничный, отпуск и т.д."
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
                  color: colors.text.primary 
                }}
              />
              
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'flex-end', 
                marginTop: spacing.lg, 
                gap: spacing.sm 
              }}>
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