// screens/home/components/CalendarSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';
import { DAYS } from '@/types/home_index';

interface CalendarSectionProps {
  selectedDate: number;
  onDateSelect: (date: number) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  return (
    <View style={styles.calendarSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Calendar</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarScrollContent}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day.date}
            onPress={() => onDateSelect(day.date)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedDate === day.date
                  ? (["#FF6B6B", "#FF8E8E"] as [string, string])
                  : ([colors.background.secondary, colors.background.secondary] as [string, string])
              }
              style={[
                styles.dayCard,
                selectedDate === day.date && styles.dayCardActive,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDate === day.date && styles.dayTextActive,
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDate === day.date && styles.dateTextActive,
                ]}
              >
                {day.date}
              </Text>
              {selectedDate === day.date && <View style={styles.activeIndicator} />}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};