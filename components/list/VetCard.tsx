// components/list/VetCard.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface VetCardProps {
  vet: {
    id: string;
    userId: number;  // ← ДОБАВЛЕНО
    firstName: string;
    lastName: string;
    avatarUrl: string;
    specialty: string;
    experienceYears: number;
    rating: number;
    reviewsCount: number;
    pricePerVisit: number;
    distance?: number;
    clinicName: string;
    isAvailableToday: boolean;
    address: string;
    specialistType?: 'VET' | 'SERVICE';  // ← ДОБАВЛЕНО (опционально)
  };
  onPress: () => void;
}

export const VetCard: React.FC<VetCardProps> = ({ vet, onPress }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 28, 
        padding: 20, 
        marginBottom: 16, 
        ...(colors.card.default === '#FFFFFF' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }),
      }}
    >
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Avatar - bigger */}
        <Image
          source={{ uri: vet.avatarUrl }}
          style={{
            width: 90, 
            height: 90, 
            borderRadius: 45, 
            borderWidth: 2,
            borderColor: colors.primary.main,
            backgroundColor: colors.background.tertiary, 
          }}
        />

        {/* Info */}
        <View style={{ flex: 1, gap: 8 }}>
          {/* Name only - no stars here anymore */}
          <View>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {vet.specialty !== 'Service Provider' ? 'Dr. ' : ''}
              {vet.firstName} {vet.lastName}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {vet.specialty}
            </Text>
          </View>

          {/* Rating Badge - new separate component */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              backgroundColor: '#FFF7E0',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
              gap: 4,
            }}
          >
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={[typography.caption, { fontWeight: '600', color: colors.text.primary }]}>
              {vet.rating.toFixed(1)}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              ({vet.reviewsCount})
            </Text>
          </View>

          {/* Experience & Distance */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {vet.experienceYears} yrs
              </Text>
            </View>
            {vet.distance && (
              <>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.secondary }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>
                    {vet.distance} km
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Clinic Name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="business-outline" size={12} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
              {vet.clinicName}
            </Text>
          </View>

          {/* Address */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
              {vet.address}
            </Text>
          </View>

          {/* Price and Availability - with chevron */}
          <View
            style={{
              marginTop: spacing.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
              <Text style={[typography.h3, { color: colors.primary.main }]}>
                {vet.pricePerVisit} ₸
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                per visit
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {vet.isAvailableToday ? (
                <View style={{
                  backgroundColor: colors.success.light,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: colors.success.dark,
                    fontWeight: '700',
                  }}>
                    Available Today
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: colors.text.tertiary + '40',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: colors.text.secondary,
                    fontWeight: '600',
                  }}>
                    Busy Today
                  </Text>
                </View>
              )}
              
              {/* Chevron indicator */}
              <Ionicons name="chevron-forward" size={22} color={colors.text.tertiary} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};