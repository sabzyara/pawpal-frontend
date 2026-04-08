import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';

interface LearnCardProps {
  onPress: () => void;
}

export const LearnCard: React.FC<LearnCardProps> = ({ onPress }) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={["#667EEA", "#764BA2"]}
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