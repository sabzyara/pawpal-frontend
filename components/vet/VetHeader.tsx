import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface VetHeaderProps {
  vet: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    specialty?: string;
    serviceType?: string;
    city?: string;
  };

  type?: 'vet' | 'service';
}

export const VetHeader: React.FC<VetHeaderProps> = ({
  vet,
  type = 'vet',
}) => {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();

  return (
    <View
      style={{
        marginBottom: spacing.lg,
      }}
    >
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginBottom: spacing.md,
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.card.default,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color={colors.text.primary}
        />
      </TouchableOpacity>

      {/* Main Card */}
      <View
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 28,
          padding: spacing.lg,
          alignItems: 'center',

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Avatar */}
        <Image
          source={{
            uri:
              vet.avatarUrl ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 4,
            borderColor: colors.primary.main,
            backgroundColor: colors.background.tertiary,
          }}
        />

        {/* Name */}
        <Text
          style={[
            typography.h3,
            {
              color: colors.text.primary,
              marginTop: spacing.md,
              textAlign: 'center',
            },
          ]}
        >
          {vet.firstName} {vet.lastName}
        </Text>

        {/* Type */}
        <View
          style={{
            marginTop: spacing.sm,
            backgroundColor: colors.primary.light,
            paddingHorizontal: spacing.md,
            paddingVertical: 8,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: colors.primary.dark,
              fontWeight: '600',
            }}
          >
            {type === 'vet'
              ? '🐾 Veterinarian'
              : '✂️ Service Provider'}
          </Text>
        </View>

        {/* Specialty */}
        {vet.specialty && (
          <Text
            style={[
              typography.body2,
              {
                color: colors.text.secondary,
                marginTop: spacing.sm,
                textAlign: 'center',
              },
            ]}
          >
            {vet.specialty}
          </Text>
        )}

        {/* Verified */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.md,
          }}
        >
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={colors.success.main}
          />

          <Text
            style={{
              marginLeft: 6,
              color: colors.text.secondary,
              fontWeight: '500',
            }}
          >
            Verified Specialist
          </Text>
        </View>
      </View>
    </View>
  );
};