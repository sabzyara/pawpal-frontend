import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface LearnCardProps {
  onPress: () => void;
}

export const LearnCard: React.FC<LearnCardProps> = ({ onPress }) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[colors.primary.main, colors.primary.light]}
        style={styles.learnCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.learnContent}>
          <View>
            <Text style={styles.learnTitle}>Learn about pets 🐾</Text>
            <Text style={styles.learnSubtitle}>Tips, guides & expert advice</Text>
          </View>
          <Feather name="arrow-right" size={24} color="#FFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};