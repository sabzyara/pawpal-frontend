import React from 'react';

import {
  TouchableOpacity,
  Text,
  View,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';

interface PetAnalysis {
  petId: number;
  petName: string;
  avatarUrl?: string;
  healthScore: number;
  riskLevel: string;
}

interface Props {
  pets: PetAnalysis[];
  onPress: () => void;
}

export default function MiniAiCard({
  pets,
  onPress,
}: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor:
          colors.card.default,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color:
              colors.text.primary,
          }}
        >
          🤖 AI Analysis
        </Text>

        <Ionicons
          name="chevron-forward"
          size={22}
          color={
            colors.text.secondary
          }
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginBottom: 16,
        }}
      >
        {pets
          .slice(0, 4)
          .map((pet) => (
            <Image
              key={pet.petId}
              source={{
                uri: pet.avatarUrl,
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                marginRight: -8,
                borderWidth: 2,
                borderColor: '#fff',
              }}
            />
          ))}
      </View>

      {pets
        .slice(0, 3)
        .map((pet) => {
          const riskColor =
            pet.riskLevel === 'LOW'
              ? '#4CAF50'
              : pet.riskLevel ===
                'MEDIUM'
              ? '#FF9800'
              : '#F44336';

          return (
            <View
              key={pet.petId}
              style={{
                flexDirection:
                  'row',
                justifyContent:
                  'space-between',
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color:
                    colors.text.primary,
                }}
              >
                {pet.petName}
              </Text>

              <Text
                style={{
                  color: riskColor,
                  fontWeight: '600',
                }}
              >
                {pet.healthScore}
              </Text>
            </View>
          );
        })}
    </TouchableOpacity>
  );
}