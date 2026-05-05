
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { createHomeStyles } from '../../styles/homeStyles';

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  notificationCount: number;
  avatarUrl?: string | null; // 🔥 добавили
  onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  greeting,
  userName,
  notificationCount,
  avatarUrl,
  onNotificationPress,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  // fallback если нет аватара
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${userName}&background=E3275B&color=fff`;

  return (
    <View style={styles.headerSection}>
      
      <View>
        <Text style={styles.greeting}>
          {greeting} 👋
        </Text>

        <Text style={styles.userName}>
          {userName}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.notificationIcon}
        >
          <Feather name="bell" size={20} color={colors.text.primary} />

          {notificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                backgroundColor: colors.primary.main,
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 10 }}>
                {notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Image
            source={{ uri: avatarUrl || fallbackAvatar }} // 🔥 ключ
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              borderWidth: 2,
              borderColor: colors.primary.main,
            }}
          />
        </TouchableOpacity>

      </View>
    </View>
  );
};

