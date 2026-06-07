import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import "../i18n";
import { useTranslation } from 'react-i18next';

export default function AnalysisScreen() {
  const { colors, spacing, typography } =
    useTheme();
  const { t } = useTranslation();
  const [pets, setPets] =
    useState<any[]>([]);

  const [selectedPet, setSelectedPet] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [analysis, setAnalysis] =
    useState<any>(null);

useFocusEffect(
  useCallback(() => {
    loadPets();
  }, [])
);

  useEffect(() => {
    if (selectedPet) {
      loadAnalysis(selectedPet);
    }
  }, [selectedPet]);

  const loadPets = async () => {
    try {
      const res = await api.get(
        '/pet-management/api/pets'
      );

      const petsData = Array.isArray(
        res.data
      )
        ? res.data.map(
            (p: any) => p.pet ?? p
          )
        : [];

      setPets(petsData);

      if (petsData.length > 0) {
        setSelectedPet(
          petsData[0].petId ??
            petsData[0].id
        );
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const loadAnalysis = async (
    petId: number
  ) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/pet-management/api/recommendations/${petId}`
      );

      setAnalysis(res.data);
    } catch (e) {
      console.log(e);

      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent:
            'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (pets.length === 0) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent:
          'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color:
            colors.text.primary,
        }}
      >
        {t('analysis.addPet')}
      </Text>
    </View>
  );
}

if (!analysis) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent:
          'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color:
            colors.text.primary,
        }}
      >
        {t('analysis.Analysis unavailable')}
      </Text>
    </View>
  );
}

return (
  <SafeAreaView
    style={{
      flex: 1,
      backgroundColor:
        colors.background.secondary,
    }}
    edges={['top']}
  >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: spacing.lg,
      }}
    >
      <Text
        style={[
          typography.h2,
          {
            marginBottom: spacing.lg,
            color:
              colors.text.primary,
          },
        ]}
      >
        {t('analysis.title')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        style={{
          marginBottom:
            spacing.lg,
        }}
      >
        {pets.map((pet) => {
          const petId =
            pet.petId ?? pet.id;

          const active =
            selectedPet === petId;

          return (
            <TouchableOpacity
              key={petId}
              onPress={() =>
                setSelectedPet(
                  petId
                )
              }
              style={{
                alignItems:
                  'center',
                marginRight: 16,
              }}
            >
              <Image
                source={{
                  uri:
                    pet.avatarUrl,
                }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  borderWidth: 3,
                  borderColor: active
                    ? colors
                        .primary.main
                    : 'transparent',
                  backgroundColor:
                    colors.card
                      .default,
                }}
              />

              <Text
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight:
                    '600',
                  color:
                    colors.text
                      .primary,
                }}
              >
                {pet.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={{
          backgroundColor:
            colors.card.default,
          borderRadius: 24,
          padding:
            spacing.lg,
          alignItems:
            'center',
          marginBottom:
            spacing.lg,
        }}
      >
        <Text
          style={[
            typography.caption,
            {
              color:
                colors.text
                  .secondary,
            },
          ]}
        >
          {t('analysis.Health Score')}
        </Text>

        <Text
          style={{
            fontSize: 48,
            fontWeight:
              '700',
            color:
              colors.primary
                .main,
          }}
        >
          {
            analysis.healthScore
          }
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontWeight:
              '600',
            color:
              analysis.riskLevel ===
              'LOW'
                ? '#4CAF50'
                : analysis.riskLevel ===
                  'MEDIUM'
                ? '#FF9800'
                : '#F44336',
          }}
        >
          {
            analysis.riskLevel
          }
        </Text>
      </View>

      <View
        style={{
          backgroundColor:
            colors.card.default,
          borderRadius: 24,
          padding:
            spacing.lg,
        }}
      >
        <Text
          style={[
            typography.h4,
            {
              marginBottom:
                spacing.md,
              color:
                colors.text
                  .primary,
            },
          ]}
        >
          {t('analysis.Recommendations')}
        </Text>

        {analysis.recommendations?.map(
          (
            item: string,
            index: number
          ) => (
            <View
              key={index}
              style={{
                flexDirection:
                  'row',
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={
                  colors.primary
                    .main
                }
              />

              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color:
                    colors.text
                      .primary,
                }}
              >
                {item}
              </Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
);
}