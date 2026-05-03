import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface DateItem {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const VetAvailability: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate calendar days
  const generateCalendarDays = (): DateItem[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: DateItem[] = [];
    
    // Previous month days
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }
    
    // Next month days (to fill 6 rows = 42 days)
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

  const timeSlots: TimeSlot[] = [
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '12:00 PM', available: false },
    { time: '1:00 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: false },
    { time: '4:00 PM', available: true },
    { time: '5:00 PM', available: true },
  ];

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const calendarDays = generateCalendarDays();

  return (
    <View style={{ gap: spacing.lg }}>
      {/* Section Header */}
      <View>
        <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Select a Date & Time
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary }]}>
          Choose a date and time that works for you
        </Text>
      </View>

      {/* Calendar Section */}
      <View
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 20,
          padding: spacing.md,
          ...(colors.card.default === '#FFFFFF' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }),
        }}
      >
        {/* Month Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
            paddingHorizontal: spacing.sm,
          }}
        >
          <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: spacing.sm }}>
            <Text style={{ fontSize: 20, color: colors.text.primary }}>←</Text>
          </TouchableOpacity>
          
          <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
            {formatMonthYear(currentMonth)}
          </Text>
          
          <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: spacing.sm }}>
            <Text style={{ fontSize: 20, color: colors.text.primary }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Week Days Header */}
        <View
          style={{
            flexDirection: 'row',
            marginBottom: spacing.sm,
            paddingHorizontal: spacing.xs,
          }}
        >
          {weekDays.map((day) => (
            <View
              key={day}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: spacing.xs,
              }}
            >
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.secondary, fontWeight: '600' },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <FlatList
          data={calendarDays}
          numColumns={7}
          scrollEnabled={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            const isSelected = isDateSelected(item.date);
            const today = isToday(item.date);
            
            return (
              <TouchableOpacity
                onPress={() => {
                  if (item.isCurrentMonth) {
                    setSelectedDate(item.date);
                  }
                }}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 2,
                }}
                disabled={!item.isCurrentMonth}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isSelected
                      ? colors.primary.main
                      : today && !isSelected
                      ? colors.primary.light + '40'
                      : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
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

      {/* Time Selection Section */}
      <View>
        <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
          Select a Time
        </Text>
        
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
          }}
        >
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.time}
              onPress={() => slot.available && setSelectedTime(slot.time)}
              style={{
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: 10,
                backgroundColor:
                  selectedTime === slot.time
                    ? colors.primary.main
                    : slot.available
                    ? colors.background.tertiary
                    : colors.background.secondary,
                borderWidth: selectedTime === slot.time ? 0 : 1,
                borderColor: colors.border.light,
                opacity: slot.available ? 1 : 0.5,
                minWidth: 100,
                alignItems: 'center',
              }}
              disabled={!slot.available}
            >
              <Text
                style={{
                  color:
                    selectedTime === slot.time
                      ? colors.text.inverse
                      : slot.available
                      ? colors.text.primary
                      : colors.text.tertiary,
                  fontWeight: selectedTime === slot.time ? '600' : '400',
                }}
              >
                {slot.time}
              </Text>
              {selectedTime === slot.time && (
                <Text style={{ color: colors.text.inverse, marginLeft: 4 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <View
          style={{
            marginTop: spacing.sm,
            padding: spacing.md,
            backgroundColor: colors.primary.light + '20',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.primary.light,
          }}
        >
          <Text
            style={[
              typography.body2,
              {
                color: colors.text.primary,
                textAlign: 'center',
              },
            ]}
          >
            📅 Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })} at {selectedTime}
          </Text>
        </View>
      )}
    </View>
  );
};