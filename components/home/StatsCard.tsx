// screens/home/components/StatsCards.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '../../styles/homeStyles';

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
  const styles = createHomeStyles(colors);

  const stats = [
    {
      icon: <MaterialCommunityIcons name="paw" size={28} color="#FFF" />,
      number: totalPets,
      label: "Total Pets",
      gradient: ["#FF6B6B", "#FF8E8E"] as [string, string],
    },
    {
      icon: <Feather name="check-circle" size={28} color="#FFF" />,
      number: completedTasks,
      label: "Completed",
      gradient: ["#4ECDC4", "#6BE4DC"] as [string, string],
    },
    {
      icon: <Feather name="clock" size={28} color="#FFF" />,
      number: pendingTasks,
      label: "Pending",
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