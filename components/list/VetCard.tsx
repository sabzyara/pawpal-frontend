import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface VetCardProps {
  vet: {
    id: string;
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
  };
  onPress: () => void;
}

export const VetCard: React.FC<VetCardProps> = ({ vet, onPress }) => {
  const { colors, spacing, typography } = useTheme();

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(vet.rating);
    const hasHalfStar = vet.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={14} color="#FFB800" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half-star" name="star-half" size={14} color="#FFB800" />
      );
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#D1D5DB" />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 20,
        padding: 16,
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
        {/* Avatar */}
        <Image
          source={{ uri: vet.avatarUrl }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 2,
            borderColor: colors.primary.main,
          }}
        />

        {/* Info */}
        <View style={{ flex: 1, gap: 6 }}>
          {/* Name and rating */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
             {vet.specialty !==
              'Service Provider'
                ? 'Dr. '
                : ''}
              {vet.firstName}
              {' '}
              {vet.lastName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {renderStars()}
              <Text style={[typography.caption, { color: colors.text.secondary, marginLeft: 4 }]}>
                ({vet.reviewsCount})
              </Text>
            </View>
          </View>

          {/* Specialty & Experience & Distance */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons
                name={
                  vet.specialty ===
                  'Veterinarian'
                    ? 'medical-outline'
                    : 'cut-outline'
                } size={12} color={colors.text.secondary} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {vet.specialty}
              </Text>
            </View>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.secondary }} />
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

          {/* Price and Availability */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
              <Text style={[typography.h4, { color: colors.primary.main }]}>
                ${vet.pricePerVisit}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>/hr</Text>
            </View>
            {vet.isAvailableToday ? (
              <View style={{
                backgroundColor: '#4CAF50',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ fontSize: 10, color: '#FFF', fontWeight: '600' }}>
                  Available Today
                </Text>
              </View>
            ) : (
              <View style={{
                backgroundColor: colors.text.tertiary + '40',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ fontSize: 10, color: colors.text.secondary, fontWeight: '600' }}>
                  Busy Today
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};