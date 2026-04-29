import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Veterinarian } from '@/types/veterinarian';

export const VetHeader = ({ vet }: { vet: Veterinarian }) => {
  const { typography, colors, spacing } = useTheme();

  return (
    <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
      <Image
        source={{ uri: vet.avatarUrl }}
        style={{
          width: spacing.avatar.xl,
          height: spacing.avatar.xl,
          borderRadius: spacing.radius.round,
          marginBottom: spacing.sm,
        }}
      />

      <Text style={[typography.h3, { color: colors.text.primary }]}>
        {vet.firstName} {vet.lastName}
      </Text>

      <Text style={[typography.body2, { color: colors.text.secondary }]}>
        Veterinarian
      </Text>
    </View>
  );
};