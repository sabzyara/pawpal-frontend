import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { timeSlotApi, scheduleApi } from '@/services/appointmentApi';
import { useUser } from '@/hooks/useUser';
import type { TimeSlot } from '@/services/appointmentApi'; // ✅ Добавлен импорт

interface DateItem {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

interface VetAvailabilityProps {
  specialistId: number;
  specialistType: 'VET' | 'SERVICE';
  onSlotSelect?: (slotId: number, startTime: string, endTime: string) => void;
}

export const VetAvailability: React.FC<VetAvailabilityProps> = ({ 
  specialistId, 
  specialistType,
  onSlotSelect 
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useUser();
  const colors = theme.colors;
  const spacing = theme.spacing;
  const typography = theme.typography;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]); 
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Загружаем расписание специалиста
  useEffect(() => {
    if (isAuthenticated && specialistId) {
      loadSchedule();
    }
  }, [specialistId, specialistType, isAuthenticated]);

  // Загружаем слоты при выборе даты
  useEffect(() => {
    if (selectedDate && isAuthenticated) {
      loadAvailableSlots();
    }
  }, [selectedDate, isAuthenticated]);

  const loadSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const data = await scheduleApi.getSchedulesBySpecialist(specialistId);
      const filteredByType = data.filter(s => s.specialistType === specialistType);
      setSchedule(filteredByType);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const result = await timeSlotApi.getAvailableSlotsForDate(
        specialistId, 
        specialistType, 
        formattedDate
      );
      setAvailableSlots(result.content || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = (): DateItem[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    let startDay = firstDayOfMonth.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: DateItem[] = [];
    
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }
    
    return days;
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSlotId(null);
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;
    
    const dayOfWeekMap: Record<number, string> = {
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
      0: 'SUNDAY'
    };
    const dayOfWeek = dayOfWeekMap[date.getDay()];
    
    return schedule.some(s => s.dayOfWeek === dayOfWeek);
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  const calendarDays = generateCalendarDays();

  const handleSelectTime = (slotId: number, startTime: string, endTime: string) => {
    setSelectedTime(startTime);
    setSelectedSlotId(slotId);
    if (onSlotSelect) {
      onSlotSelect(slotId, startTime, endTime);
    }
  };

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background.tertiary }]}>
        <Text style={[typography.body1, { color: colors.text.primary }]}>
          Авторизуйтесь для записи
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          Войдите в аккаунт, чтобы записаться на прием
        </Text>
      </View>
    );
  }

  if (loadingSchedule) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          Загрузка расписания...
        </Text>
      </View>
    );
  }

  if (schedule.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background.tertiary }]}>
        <Text style={[typography.body1, { color: colors.text.primary }]}>
          Расписание не добавлено
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          Специалист еще не заполнил график работы
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, { gap: spacing.md }]}
    >
      <View>
        <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Выберите дату и время
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          Выберите удобную дату и время для приема
        </Text>
      </View>

      <View style={[styles.calendarContainer, { backgroundColor: colors.card.default, borderRadius: spacing.lg, padding: spacing.md }]}>
        <View style={[styles.monthHeader, { marginBottom: spacing.md }]}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthArrow}>
            <Text style={{ fontSize: 20, color: colors.text.primary }}>←</Text>
          </TouchableOpacity>
          
          <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
            {formatMonthYear(currentMonth)}
          </Text>
          
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthArrow}>
            <Text style={{ fontSize: 20, color: colors.text.primary }}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.weekDaysHeader, { marginBottom: spacing.xs }]}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={[typography.caption, { color: colors.text.secondary, fontWeight: '600' }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        <FlatList
          data={calendarDays}
          numColumns={7}
          scrollEnabled={false}
          keyExtractor={(_, index) => `${currentMonth.getMonth()}-${index}`}
          renderItem={({ item }) => {
            const isSelected = isDateSelected(item.date);
            const today = isToday(item.date);
            const available = item.isCurrentMonth && isDateAvailable(item.date);
            
            return (
              <TouchableOpacity
                onPress={() => {
                  if (available) {
                    setSelectedDate(item.date);
                    setSelectedTime(null);
                    setSelectedSlotId(null);
                  }
                }}
                style={styles.dayCell}
                disabled={!available}
              >
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: isSelected
                        ? colors.primary.main
                        : today && !isSelected
                        ? colors.primary.light + '40'
                        : 'transparent',
                    },
                    { opacity: available ? 1 : 0.4 },
                  ]}
                >
                  <Text
                    style={[
                      typography.body2,
                      {
                        color: !item.isCurrentMonth
                          ? colors.text.tertiary
                          : isSelected
                          ? colors.text.inverse
                          : colors.text.primary,
                        fontWeight: isSelected || today ? '600' : '400',
                      },
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {selectedDate && (
        <View>
          <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
            Выберите время
          </Text>
          
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          ) : availableSlots.length === 0 ? (
            <View style={[styles.emptySlotsContainer, { backgroundColor: colors.background.tertiary, borderRadius: spacing.md, padding: spacing.lg }]}>
              <Text style={[typography.body2, { color: colors.text.secondary }]}>
                Нет доступных слотов на эту дату
              </Text>
            </View>
          ) : (
            <View style={[styles.timeSlotsContainer, { gap: spacing.xs }]}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() => handleSelectTime(slot.id, slot.startTime, slot.endTime)}
                  style={[
                    styles.timeSlotButton,
                    {
                      backgroundColor: selectedSlotId === slot.id
                        ? colors.primary.main
                        : colors.background.tertiary,
                      borderWidth: selectedSlotId === slot.id ? 0 : 1,
                      borderColor: colors.border.light,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.body2,
                      {
                        color: selectedSlotId === slot.id
                          ? colors.text.inverse
                          : colors.text.primary,
                        fontWeight: selectedSlotId === slot.id ? '600' : '400',
                      },
                    ]}
                  >
                    {formatTime(slot.startTime)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedDate && selectedTime && (
        <View style={[styles.selectedSummary, { 
          backgroundColor: colors.primary.light + '20', 
          borderColor: colors.primary.light,
          marginTop: spacing.xs,
          padding: spacing.md,
          borderRadius: spacing.md,
          borderWidth: 1,
        }]}>
          <Text style={[typography.body2, { color: colors.text.primary, textAlign: 'center' }]}>
            📅 Выбрано: {selectedDate.toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} в {formatTime(selectedTime)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 16,
  },
  emptySlotsContainer: {
    alignItems: 'center',
  },
  calendarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthArrow: {
    padding: 8,
  },
  weekDaysHeader: {
    flexDirection: 'row',
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedSummary: {},
});