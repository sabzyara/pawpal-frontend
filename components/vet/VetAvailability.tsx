// components/VetAvailability.tsx - ФИНАЛЬНАЯ ВЕРСИЯ (работает с 403)

import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/hooks/useTheme";
import type { TimeSlot, SpecialistScheduleResponse, SpecialistType } from "@/services/appointmentApi";
import { timeSlotApi, specialistService } from "@/services/appointmentApi";
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
import "@/app/i18n";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [specialistInfo, setSpecialistInfo] = useState<{ specialistId: number; specialistType: string } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);


  useEffect(() => {
    if (isAuthenticated && userId) {
      loadSpecialistInfo();
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (selectedDate && isAuthenticated && specialistInfo) {
      loadAvailableSlots();
    }
  }, [selectedDate, isAuthenticated, specialistInfo]);

  const loadSpecialistInfo = async () => {
    try {
      setLoadingInfo(true);
      setInfoError(null);
      
      const info = await specialistService.getSpecialistByUserId(userId);
      
      setSpecialistInfo({
        specialistId: info.specialistId,
        specialistType: info.specialistType,
      });
    } catch (error: any) {
      console.error("Error loading specialist info:", error);
      setInfoError(error?.message || "Не удалось загрузить информацию о специалисте");
    } finally {
      setLoadingInfo(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !specialistInfo) return;
    
    try {
      setLoading(true);
      
      const formattedDate = selectedDate.toISOString().split("T")[0];
      
      const result = await timeSlotApi.getAvailableSlotsByUserId(
        userId,
        formattedDate,
      );
      
      setAvailableSlots(result.slots?.content || []);
    } catch (error: any) {
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
    return date >= today;
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  const weekDays = [  t("calendar.mon"),
  t("calendar.tue"),
  t("calendar.wed"),
  t("calendar.thu"),
  t("calendar.fri"),
  t("calendar.sat"),
  t("calendar.sun"),];
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
          {t("availability.loginRequired")}
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
          {t("availability.loginDescription")}
        </Text>
      </View>
    );
  }

  if (loadingInfo) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.xs },
          ]}
        >
          {t("availability.loadingInfo")}
        </Text>
      </View>
    );
  }

  if (infoError || !specialistInfo) {
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
          name="alert-circle-outline"
          size={48}
          color={colors.error?.main || "#f44336"}
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
          {!specialistInfo ? t("availability.specialistNotFound") : t("availability.loadingError")}
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
          {infoError || t("availability.specialistNotRegistered")}
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
          {t("availability.selectDateTime")}
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          {t("availability.selectDateTimeDescription")}
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
            {t("availability.selectTime")}
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
                {t("availability.noSlots")}
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