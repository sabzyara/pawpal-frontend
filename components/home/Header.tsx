// screens/home/components/HomeHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '../../styles/homeStyles';

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  notificationCount: number;
  onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  greeting,
  userName,
  notificationCount,
  onNotificationPress,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  return (
    <LinearGradient
      colors={[colors.primary.gradient[0], colors.primary.gradient[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationIcon} 
          onPress={onNotificationPress}
        >
          <Feather name="bell" size={24} color="#FFF" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};