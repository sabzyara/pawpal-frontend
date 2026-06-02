import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { timeSlotApi } from '@/services/appointmentApi'; 
import type { TimeSlot } from '@/services/appointmentApi';
import { useUser } from '@/hooks/useUser';

interface DateTimeSelectorProps {
  specialistId: number;
  specialistType: 'VET' | 'SERVICE';
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  specialistId,
  specialistType,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}) => {
  const { colors, typography, spacing } = useTheme();
  const { isAuthenticated } = useUser();
  const [dates, setDates] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]); 
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const generatedDates = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      generatedDates.push({
        full: date,
        day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        dateNum: date.getDate(),
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        isToday: i === 0,
      });
    }
    setDates(generatedDates);
  }, []);

  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      loadAvailableSlots();
    }
  }, [selectedDate, specialistId, specialistType, isAuthenticated]);

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    try {
      setLoadingSlots(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const result = await timeSlotApi.getAvailableSlotsForDate(
        specialistId, 
        specialistType, 
        formattedDate
      );
      setAvailableSlots(result.content);  
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  if (!isAuthenticated) {
    return (
      <View style={{ 
        padding: spacing.xl, 
        alignItems: 'center',
        backgroundColor: colors.background.tertiary,
        borderRadius: spacing.md,
      }}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.text.secondary} />
        <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]}>
          Авторизуйтесь для записи
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          Чтобы записаться на прием, необходимо войти в аккаунт
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing.xs }]}>
        Выберите дату и время
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginBottom: spacing.lg }]}>
        Выберите удобное время для приема
      </Text>

      {/* Дата пикер */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.lg }}
      >
        {dates.map((item, idx) => {
          const isSelected = selectedDate?.toDateString() === item.full.toDateString();
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectDate(item.full)}
              style={{
                alignItems: 'center',
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.md,
                backgroundColor: isSelected ? colors.primary.main : colors.card.default,
                borderWidth: isSelected ? 0 : 1,
                borderColor: colors.border.light,
                minWidth: 70,
              }}
            >
              <Text style={{ 
                fontSize: 12, 
                color: isSelected ? colors.text.inverse : colors.text.secondary 
              }}>
                {item.day}
              </Text>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: '600', 
                color: isSelected ? colors.text.inverse : colors.text.primary, 
                marginVertical: spacing.xs 
              }}>
                {item.dateNum}
              </Text>
              <Text style={{ 
                fontSize: 10, 
                color: isSelected ? colors.text.inverse : colors.text.secondary 
              }}>
                {item.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Время слоты */}
      <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: spacing.sm }]}>
        Выберите время
      </Text>
      
      {loadingSlots ? (
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : availableSlots.length === 0 ? (
        <View style={{ 
          padding: spacing.xl, 
          alignItems: 'center', 
          backgroundColor: colors.background.tertiary, 
          borderRadius: spacing.md 
        }}>
          <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
          <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md }]}>
            Нет доступных слотов
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
            На выбранную дату нет свободного времени
          </Text>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {availableSlots.map((slot) => {
            const isSelected = selectedTime === slot.startTime;
            return (
              <TouchableOpacity
                key={slot.id}
                onPress={() => onSelectTime(slot.startTime)}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  borderRadius: spacing.sm,
                  backgroundColor: isSelected ? colors.primary.main : colors.background.tertiary,
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: colors.border.light,
                }}
              >
                <Text style={{ 
                  color: isSelected ? colors.text.inverse : colors.text.primary 
                }}>
                  {formatTime(slot.startTime)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};