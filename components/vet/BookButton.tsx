import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const BookButton = () => {
  const { colors, spacing, typography, shadows } = useTheme();

  return (
    <View
      style={{
        padding: spacing.md,
        borderTopWidth: 1,
        borderColor: colors.border.light,
        backgroundColor: colors.background.primary,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary.main,
          padding: spacing.md,
          borderRadius: spacing.radius.lg,
          alignItems: 'center',
          ...shadows.button,
        }}
      >
        <Text style={[typography.button, { color: colors.text.inverse }]}>
          Book Appointment
        </Text>
      </TouchableOpacity>
    </View>
  );
};