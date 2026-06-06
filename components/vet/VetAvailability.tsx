// components/VetAvailability.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/useTheme";
import type { TimeSlot, SpecialistScheduleResponse } from "@/services/appointmentApi";
import { scheduleApi, timeSlotApi, specialistService } from "@/services/appointmentApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DateItem {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

interface VetAvailabilityProps {
  userId: number;
  specialistType?: 'VET' | 'SERVICE';  
  onSlotSelect?: (slotId: number, startTime: string, endTime: string, specialistId: number, specialistType: string) => void;
}

export const VetAvailability: React.FC<VetAvailabilityProps> = ({
  userId,
  specialistType: propSpecialistType,
  onSlotSelect,
}) => {
  const theme = useTheme();
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const colors = theme.colors;
  const spacing = theme.spacing;
  const typography = theme.typography;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [schedule, setSchedule] = useState<SpecialistScheduleResponse[]>([]);  // ✅ Исправлен тип
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [specialistInfo, setSpecialistInfo] = useState<{ specialistId: number; specialistType: string } | null>(null);

  // Загружаем информацию о специалисте и его расписание
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadSpecialistInfo();
    }
  }, [userId, isAuthenticated]);

  // Загружаем слоты при выборе даты
  useEffect(() => {
    if (selectedDate && isAuthenticated && specialistInfo) {
      loadAvailableSlots();
    }
  }, [selectedDate, isAuthenticated, specialistInfo]);

  const loadSpecialistInfo = async () => {
    try {
      setLoadingSchedule(true);
      const info = await specialistService.getSpecialistByUserId(userId);
      setSpecialistInfo({
        specialistId: info.specialistId,
        specialistType: info.specialistType,
      });
      
      await loadSchedule(info.specialistId, info.specialistType);
    } catch (error) {
      console.error("Error loading specialist info:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const loadSchedule = async (specId: number, specType: string) => {
    try {
      const data = await scheduleApi.getSchedulesBySpecialistId(specId);
      const filteredByType = data.filter(
        (s) => s.specialistType === specType,
      );
      setSchedule(filteredByType);
    } catch (error) {
      console.error("Error loading schedule:", error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !specialistInfo) return;
    
    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split("T")[0];
      
      // ✅ Исправлено: правильный доступ к данным
      const result = await timeSlotApi.getAvailableSlotsByUserId(
        userId,
        formattedDate,
      );
      
      // ✅ result.slots.content, а не result.content
      setAvailableSlots(result.slots?.content || []);
    } catch (error) {
      console.error("Error loading slots:", error);
      setAvailableSlots([]);
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
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + increment,
        1,
      ),
    );
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
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
      0: "SUNDAY",
    };
    const dayOfWeek = dayOfWeekMap[date.getDay()];

    return schedule.some((s) => s.dayOfWeek === dayOfWeek);
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const calendarDays = generateCalendarDays();

  const handleSelectTime = (
    slotId: number,
    startTime: string,
    endTime: string,
  ) => {
    setSelectedTime(startTime);
    setSelectedSlotId(slotId);
    if (onSlotSelect && specialistInfo) {
      onSlotSelect(slotId, startTime, endTime, specialistInfo.specialistId, specialistInfo.specialistType);
    }
  };

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.background.tertiary,
            borderRadius: 24,
            padding: spacing.xl,
          },
        ]}
      >
        <Ionicons
          name="log-in-outline"
          size={48}
          color={colors.text.tertiary}
        />
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginTop: spacing.sm },
          ]}
        >
          Авторизуйтесь для записи
        </Text>
        <Text
          style={[
            typography.caption,
            {
              color: colors.text.secondary,
              marginTop: spacing.xs,
              textAlign: "center",
            },
          ]}
        >
          Войдите в аккаунт, чтобы записаться на прием
        </Text>
      </View>
    );
  }

  if (loadingSchedule) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.xs },
          ]}
        >
          Загрузка расписания...
        </Text>
      </View>
    );
  }

  if (schedule.length === 0) {
    return (
      <View
        style={{
          padding: spacing.xl,
          alignItems: "center",
          backgroundColor: colors.card.default,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}
      >
        <Ionicons
          name="calendar-outline"
          size={48}
          color={colors.text.tertiary}
        />

        <Text
          style={[
            typography.body1SemiBold,
            {
              color: colors.text.primary,
              marginTop: spacing.sm,
            },
          ]}
        >
          Расписание не добавлено
        </Text>

        <Text
          style={[
            typography.caption,
            {
              color: colors.text.secondary,
              marginTop: 4,
              textAlign: "center",
            },
          ]}
        >
          Специалист пока не указал рабочие дни
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
        <Text
          style={[
            typography.h4,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          Выберите дату и время
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          Выберите удобную дату и время для приема
        </Text>
      </View>

      <View
        style={[
          styles.calendarContainer,
          {
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          },
        ]}
      >
        <View style={[styles.monthHeader, { marginBottom: spacing.md }]}>
          <TouchableOpacity
            onPress={() => changeMonth(-1)}
            style={styles.monthArrow}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text.primary}
            />
          </TouchableOpacity>

          <Text
            style={[typography.body1SemiBold, { color: colors.text.primary }]}
          >
            {formatMonthYear(currentMonth)}
          </Text>

          <TouchableOpacity
            onPress={() => changeMonth(1)}
            style={styles.monthArrow}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.weekDaysHeader, { marginBottom: spacing.xs }]}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.secondary, fontWeight: "600" },
                ]}
              >
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
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected
                        ? colors.primary.main
                        : today && !isSelected
                          ? (colors.primary.light || "#4CAF50") + "40"
                          : "transparent",
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: colors.primary.light,
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
                        fontWeight: isSelected || today ? "600" : "400",
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
          <Text
            style={[
              typography.h4,
              { color: colors.text.primary, marginBottom: spacing.md },
            ]}
          >
            Выберите время
          </Text>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
            </View>
          ) : availableSlots.length === 0 ? (
            <View
              style={[
                styles.emptySlotsContainer,
                {
                  backgroundColor: colors.background.tertiary,
                  borderRadius: spacing.md,
                  padding: spacing.lg,
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={32}
                color={colors.text.tertiary}
              />
              <Text
                style={[
                  typography.body2,
                  { color: colors.text.secondary, marginTop: spacing.xs },
                ]}
              >
                Нет доступных слотов на эту дату
              </Text>
            </View>
          ) : (
            <View style={[styles.timeSlotsContainer, { gap: spacing.xs }]}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() =>
                    handleSelectTime(slot.id, slot.startTime, slot.endTime)
                  }
                  style={[
                    styles.timeSlotButton,
                    {
                      paddingVertical: 14,
                      paddingHorizontal: 20,
                      borderRadius: 18,
                      minWidth: 110,
                      backgroundColor:
                        selectedSlotId === slot.id
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
                        color:
                          selectedSlotId === slot.id
                            ? colors.text.inverse
                            : colors.text.primary,
                        fontWeight: selectedSlotId === slot.id ? "600" : "400",
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
        <View
          style={[
            styles.selectedSummary,
            {
              backgroundColor: (colors.primary.light || "#4CAF50") + "20",
              borderColor: colors.primary.light,
              marginTop: spacing.xs,
              padding: spacing.md,
              borderRadius: spacing.md,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              typography.body2,
              { color: colors.text.primary, textAlign: "center" },
            ]}
          >
            📅 Выбрано:{" "}
            {selectedDate.toLocaleDateString("ru-RU", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            в {formatTime(selectedTime)}
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
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptySlotsContainer: {
    alignItems: "center",
  },
  calendarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthArrow: {
    padding: 8,
  },
  weekDaysHeader: {
    flexDirection: "row",
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  dayCircle: {},
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeSlotButton: {
    alignItems: "center",
  },
  selectedSummary: {},
});