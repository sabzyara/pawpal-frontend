import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const VetAvailability = () => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card.default,
        padding: spacing.md,
        borderRadius: spacing.radius.lg,
      }}
    >
      <Text style={[typography.body2, { color: colors.text.secondary }]}>
        Monday - Friday
      </Text>

      <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
        10:00 AM - 18:00 PM
      </Text>
    </View>
  );
};