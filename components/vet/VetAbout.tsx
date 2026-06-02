import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface VetAboutProps {
  vet: {
    about?: string;
    address?: string;
    education?: string;
    languages?: string[];
    phoneNumber?: string;
    clinicName?: string;
  };
}

export const VetAbout: React.FC<VetAboutProps> = ({ vet }) => {
  const { colors, spacing, typography } = useTheme();

  const handlePhonePress = () => {
    const phoneUrl = `tel:${vet.phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((err) => console.error('Error opening phone dialer:', err));
  };

  const handleLocationPress = () => {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(vet.address || '')}`;
  Linking.openURL(mapsUrl).catch((err) => 
    console.error('Error opening maps:', err)
  );
};

  return (
    <View
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 20,
        padding: spacing.md,
        gap: spacing.md,
        ...(colors.card.default === '#FFFFFF' && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }),
      }}
    >
      {/* About Text */}
      <Text style={[typography.body1, { color: colors.text.primary, lineHeight: 24 }]}>
        {vet.about || 'No description'}
      </Text>

      {/* Clinic Name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="business-outline" size={18} color={colors.primary.main} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Clinic
          </Text>
          <Text style={[typography.body2, { color: colors.text.primary }]}>
            {vet.clinicName || 'Not specified'}
          </Text>
        </View>
      </View>

      {/* Address (Touchable for maps) */}
      <TouchableOpacity 
        onPress={handleLocationPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <Ionicons name="location-outline" size={18} color={colors.primary.main} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Location
          </Text>
          <Text style={[typography.body2, { color: colors.text.primary }]}>
            {vet.address || 'Not specified'}
          </Text>
        </View>
        <Ionicons name="open-outline" size={14} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Phone Number (Touchable for calling) */}
      <TouchableOpacity 
        onPress={handlePhonePress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <Ionicons name="call-outline" size={18} color={colors.primary.main} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Phone Number
          </Text>
          <Text style={[typography.body2, { color: colors.text.primary }]}>
            {vet.phoneNumber || 'Not specified'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Education */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="school-outline" size={18} color={colors.primary.main} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Education
          </Text>
          <Text style={[typography.body2, { color: colors.text.primary }]}>
            {vet.education || 'Not specified'}
          </Text>
        </View>
      </View>

      {/* Languages */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="language-outline" size={18} color={colors.primary.main} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            Languages Spoken
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {(vet.languages || []).map(
                (language, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.background.tertiary,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={[typography.caption, { color: colors.text.primary }]}>
                  {language}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};