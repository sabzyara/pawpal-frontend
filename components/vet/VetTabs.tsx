import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const VetTabs = ({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: any) => void;
}) => {
  const { colors, spacing, typography } = useTheme();

  const tabs = ['about', 'availability', 'reviews'];

  return (
    <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
      {tabs.map((tab) => {
        const isActive = active === tab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            style={{
              flex: 1,
              padding: spacing.sm,
              borderRadius: spacing.radius.md,
              backgroundColor: isActive
                ? colors.primary.main
                : colors.background.secondary,
              marginRight: spacing.sm,
            }}
          >
            <Text
              style={[
                typography.body2SemiBold,
                {
                  textAlign: 'center',
                  color: isActive
                    ? colors.text.inverse
                    : colors.text.primary,
                },
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};