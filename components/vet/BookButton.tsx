import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface BookButtonProps {
  vetId: string;
}

export const BookButton: React.FC<BookButtonProps> = ({ vetId }) => {
  const { colors, spacing, typography } = useTheme();

  const handleBookPress = () => {
    Alert.alert(
      'Book Appointment',
      'Would you like to schedule an appointment with this veterinarian?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', onPress: () => console.log('Booking appointment for vet:', vetId) },
      ]
    );
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
          Book Appointment
        </Text>
      </TouchableOpacity>
    </View>
  );
};