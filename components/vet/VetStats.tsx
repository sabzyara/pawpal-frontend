import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface VetStatsProps {
  vet: {
    experienceYears: number;
    patientsCount: number;
    rating: number;
  };
}

export const VetStats: React.FC<VetStatsProps> = ({ vet }) => {
  const { colors, spacing, typography } = useTheme();

  const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
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
        backgroundColor: colors.card.default,
        padding: spacing.md,
        borderRadius: 999,
        marginBottom: spacing.lg,
        ...(colors.card.default === '#FFFFFF' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }),
      }}
    >
      <StatItem label="Experience" value={`${vet.experienceYears} yrs`} />
      <StatItem label="Patients" value={vet.patientsCount} />
      <StatItem label="Rating" value={vet.rating} />
    </View>
  );
};