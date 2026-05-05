import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface DateTimeSelectorProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}

const generateDates = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date,
      isToday: i === 0,
    });
  }
  return dates;
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM',
];

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}) => {
  const { colors, spacing, typography } = useTheme();
  const dates = generateDates();

  return (
    <View>
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: 8 }]}>
        Select Date & Time
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginBottom: 20 }]}>
        Choose a convenient time for your appointment
      </Text>

      {/* Date Selection */}
      <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 12 }]}>
        Select Date
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, marginBottom: 24 }}
      >
        {dates.map((item, idx) => {
          const isSelected = selectedDate?.toDateString() === item.full.toDateString();
          
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectDate(item.full)}
              style={{
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: isSelected ? colors.primary.main : colors.card.default,
                borderWidth: isSelected ? 0 : 1,
                borderColor: colors.border.light,
                minWidth: 70,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isSelected ? colors.text.inverse : colors.text.secondary,
                }}
              >
                {item.day}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: isSelected ? colors.text.inverse : colors.text.primary,
                  marginVertical: 4,
                }}
              >
                {item.date}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: isSelected ? colors.text.inverse : colors.text.secondary,
                }}
              >
                {item.month}
              </Text>
              {item.isToday && !isSelected && (
                <Text
                  style={{
                    fontSize: 8,
                    color: colors.primary.main,
                    marginTop: 2,
                  }}
                >
                  Today
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Time Selection */}
      <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 12 }]}>
        Select Time
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {timeSlots.map((time) => {
          const isSelected = selectedTime === time;
          const isAvailable = !['12:00 PM', '12:30 PM'].includes(time); // Mock unavailable slots
          
          return (
            <TouchableOpacity
              key={time}
              onPress={() => isAvailable && onSelectTime(time)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: isSelected
                  ? colors.primary.main
                  : isAvailable
                  ? colors.background.tertiary
                  : colors.background.secondary,
                borderWidth: isSelected ? 0 : 1,
                borderColor: colors.border.light,
                opacity: isAvailable ? 1 : 0.5,
              }}
              disabled={!isAvailable}
            >
              <Text
                style={{
                  color: isSelected
                    ? colors.text.inverse
                    : isAvailable
                    ? colors.text.primary
                    : colors.text.tertiary,
                  fontWeight: isSelected ? '600' : '400',
                }}
              >
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: colors.primary.main + '15',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primary.main + '30',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="calendar" size={20} color={colors.primary.main} />
            <Text style={[typography.body2, { color: colors.text.primary }]}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <Ionicons name="time" size={20} color={colors.primary.main} />
            <Text style={[typography.body2, { color: colors.text.primary }]}>
              {selectedTime}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};