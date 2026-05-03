import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface VetHeaderProps {
  vet: {
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
}

export const VetHeader: React.FC<VetHeaderProps> = ({ vet }) => {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={{ marginBottom: spacing.md, padding: 4 }}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={{ alignItems: 'center' }}>
        <Image
          source={{ uri: vet.avatarUrl }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: spacing.sm,
            borderWidth: 3,
            borderColor: colors.primary.main,
            backgroundColor: colors.background.tertiary,
          }}
        />
        <Text style={[typography.h3, { color: colors.text.primary }]}>
          Dr. {vet.firstName} {vet.lastName}
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: 4 }]}>
          Veterinarian
        </Text>
      </View>
    </View>
  );
};