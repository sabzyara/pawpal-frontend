import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const VetAbout = ({ text }: { text?: string }) => {
  const { colors, spacing, typography, shadows } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card.default,
        padding: spacing.md,
        borderRadius: spacing.radius.lg,
        ...shadows.card,
      }}
    >
      <Text style={[typography.body1, { color: colors.text.primary }]}>
        {text}
      </Text>
    </View>
  );
};