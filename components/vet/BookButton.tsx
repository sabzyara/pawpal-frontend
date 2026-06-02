import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface BookButtonProps {
  specialistId: number;
  specialistType: 'VET' | 'SERVICE';
  specialistName?: string;
}

export const BookButton: React.FC<BookButtonProps> = ({ 
  specialistId, 
  specialistType, 
  specialistName 
}) => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();

  const handleBookPress = () => {
    router.push({
      pathname: '/book-appointment',
      params: {
        specialistId: specialistId.toString(),
        specialistType: specialistType,
        specialistName: specialistName || (specialistType === 'VET' ? 'Ветеринар' : 'Специалист'),
      },
    });
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        backgroundColor: colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
      }}
    >
      <TouchableOpacity
        onPress={handleBookPress}
        style={{
          backgroundColor: colors.primary.main,
          padding: spacing.md,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Text style={[typography.button, { color: colors.text.inverse }]}>
          Записаться на прием
        </Text>
      </TouchableOpacity>
    </View>
  );
};