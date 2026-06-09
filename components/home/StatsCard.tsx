// components/home/StatsCards.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import "@/app/i18n";
import { useTranslation } from 'react-i18next';

interface StatsCardsProps {
  totalPets: number;
  completedTasks: number;
  pendingTasks: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalPets,
  completedTasks,
  pendingTasks,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const stats = [
    {
      icon: <MaterialCommunityIcons name="paw" size={28} color="#FFF" />,
      number: totalPets,
      label: t("stats.Total Pets"),
      gradient: ["#FF6B6B", "#FF8E8E"] as [string, string],
    },
    {
      icon: <Feather name="check-circle" size={28} color="#FFF" />,
      number: completedTasks,
      label: t("stats.Completed"),
      gradient: ["#4ECDC4", "#6BE4DC"] as [string, string],
    },
    {
      icon: <Feather name="clock" size={28} color="#FFF" />,
      number: pendingTasks,
      label: t("stats.Pending"),
      gradient: ["#FFE66D", "#FFED9E"] as [string, string],
    },
  ];

  return (
    <View style={styles.statsContainer}>
      {stats.map((stat, index) => (
        <LinearGradient
          key={index}
          colors={stat.gradient}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {stat.icon}
          <Text style={styles.statNumber}>{stat.number}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </LinearGradient>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    opacity: 0.9,
  },
});