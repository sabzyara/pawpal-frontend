import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CalendarSectionProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  const today = new Date();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const full = `${d.getFullYear()}-${
      String(d.getMonth() + 1).padStart(2, "0")
    }-${String(d.getDate()).padStart(2, "0")}`;

    return {
      full,
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
    };
  });

  return (
    <View style={styles.calendarSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Calendar</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarScrollContent}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day.full}
            onPress={() => onDateSelect(day.full)}
          >
            <LinearGradient
              colors={
                selectedDate === day.full
                  ? [colors.tracker.primary, colors.tracker.secondary]
                  : [colors.background.secondary, colors.background.secondary]
              }
              style={[
                styles.dayCard,
                selectedDate === day.full && styles.dayCardActive,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === day.full && styles.dayTextActive,
                ]}
              >
                {day.day}
              </Text>

              <Text
                style={[
                  styles.dateText,
                  selectedDate === day.full && styles.dateTextActive,
                ]}
              >
                {day.date}
              </Text>

              {selectedDate === day.full && (
                <View style={styles.activeIndicator} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};