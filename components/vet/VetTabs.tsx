import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface VetTabsProps {
  active: 'about' | 'availability' | 'reviews';
  onChange: (tab: 'about' | 'availability' | 'reviews') => void;
}

export const VetTabs: React.FC<VetTabsProps> = ({ active, onChange }) => {
  const { colors, spacing, typography } = useTheme();

  const tabs: Array<'about' | 'availability' | 'reviews'> = ['about', 'availability', 'reviews'];

  const tabLabels = {
    about: 'About',
    availability: 'Availability',
    reviews: 'Reviews',
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.background.tertiary,
        borderRadius: 999,
        padding: 4,
        marginBottom: spacing.lg,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab === active;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: 999,
              backgroundColor: isActive ? colors.primary.main : 'transparent',
            }}
          >
            <Text
              style={[
                typography.body2SemiBold,
                {
                  textAlign: 'center',
                  color: isActive ? colors.text.inverse : colors.text.secondary,
                },
              ]}
            >
              {tabLabels[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};