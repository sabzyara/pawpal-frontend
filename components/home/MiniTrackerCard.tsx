import React from 'react';

import {
  TouchableOpacity,
  Text,
  View,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import Donut from '@/components/tracker/Donut';
import "@/app/i18n";
import { useTranslation } from 'react-i18next';

interface PetTracker {
  petId: number;
  petName: string;
  avatarUrl?: string;
  calories: number;
  activity: number;
}

interface Props {
  pets: PetTracker[];
  onPress: () => void;
}

export default function MiniTrackerCard({
  pets,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text.primary,
          }}
        >
          {t('tracker.title')}
        </Text>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={colors.text.secondary}
        />
      </View>

      {pets.map((pet) => (
        <View
          key={pet.petId}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 18,
            backgroundColor: colors.card.elevated,
            borderRadius: 18,
            padding: 12,
          }}
        >
          <Image
            source={{
              uri:
                pet.avatarUrl ||
                'https://cdn-icons-png.flaticon.com/512/616/616408.png',
            }}
            style={{
              width: 55,
              height: 55,
              borderRadius: 27,
            }}
          />

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              {pet.petName}
            </Text>

            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 13,
              }}
            >
              🔥 {pet.calories} kcal
            </Text>

            <Text
              style={{
                color: colors.text.secondary,
                fontSize: 13,
              }}
            >
              🏃 {pet.activity} min
            </Text>
          </View>

          <View
            style={{
              width: 70,
              height: 70,
            }}
          >
            <Donut
            value={pet.calories}
            max={2000}
            size={70}
            />
          </View>
        </View>
      ))}
    </TouchableOpacity>
  );
}