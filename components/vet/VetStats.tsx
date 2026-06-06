import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const StatCard = ({
    icon,
    value,
    label,
    color,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    value: string | number;
    label: string;
    color: string;
  }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card.default,
        borderRadius: 20,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Ionicons
        name={icon}
        size={24}
        color={color}
      />

      <Text
        style={[
          typography.h4,
          {
            color: colors.text.primary,
            marginTop: spacing.xs,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          typography.caption,
          {
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: 2,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
      }}
    >
      <StatCard
        icon="star"
        value={vet.rating.toFixed(1)}
        label="Рейтинг"
        color="#FFB800"
      />

      <StatCard
        icon="paw"
        value={vet.patientsCount}
        label="Клиенты"
        color={colors.primary.main}
      />

      <StatCard
        icon="school"
        value={vet.experienceYears}
        label="Лет опыта"
        color={colors.success.main}
      />
    </View>
  );
};