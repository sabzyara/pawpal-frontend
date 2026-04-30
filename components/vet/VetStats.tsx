import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Veterinarian } from '@/types/veterinarian';

export const VetStats = ({ vet }: { vet: Veterinarian }) => {
  const { colors, spacing, typography, shadows } = useTheme();

  const Item = ({ label, value }: any) => (
    <View style={{ alignItems: 'center' }}>
      <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.text.secondary }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.card.elevated,
        padding: spacing.md,
        borderRadius: spacing.radius.lg,
        marginBottom: spacing.lg,
        ...shadows.card,
      }}
    >
      <Item label="Experience" value={`${vet.experienceYears} yrs`} />
      <Item label="Patients" value={vet.patientsCount} />
      <Item label="Rating" value={vet.rating} />
    </View>
  );
};