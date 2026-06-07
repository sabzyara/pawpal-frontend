// components/vet/BookButton.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import "@/app/i18n";
import { useTranslation } from 'react-i18next';

interface BookButtonProps {
  userId: number;       
  specialistType: 'VET' | 'SERVICE';
  specialistName: string;
}

export const BookButton: React.FC<BookButtonProps> = ({
  userId,
  specialistType,
  specialistName,
}) => {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const handlePress = () => {
    router.push({
      pathname: '/book-appointment',
      params: {
        specialistUserId: userId,       
        specialistType: specialistType,
        specialistName: specialistName,
      },
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.primary.main,
          borderRadius: spacing.md,
          paddingVertical: spacing.md,
          marginHorizontal: spacing.md,
          marginBottom: spacing.md,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons name="calendar" size={24} color={colors.text.inverse} />
      <Text
        style={[
          typography.button,
          { color: colors.text.inverse, marginLeft: spacing.sm },
        ]}
      >
        {t('book.title')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});