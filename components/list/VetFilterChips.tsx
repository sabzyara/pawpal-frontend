import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const VetFilterChips: React.FC<Props> = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  const { colors, typography } = useTheme();

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'General Practitioner', label: 'General' },
    { id: 'Surgeon', label: 'Surgery' },
    { id: 'Dentist', label: 'Dental' },
    { id: 'Dermatologist', label: 'Skin' },
    { id: 'Emergency Care', label: 'Emergency' },
    { id: 'Pediatrician', label: 'Pediatrics' },
  ];

  return (
    <View
      style={{
        backgroundColor: colors.background.primary,
        paddingVertical: 10,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center', // 🔥 ВАЖНО
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 20,
                marginRight: 8, // 🔥 вместо gap (он иногда ломает layout)
                backgroundColor: isSelected
                  ? colors.primary.main
                  : colors.background.tertiary,
                borderWidth: 1,
                borderColor: colors.border.light,

                alignSelf: 'flex-start', // 🔥 КРИТИЧНО
              }}
            >
              <Text
                style={[
                  typography.body2,
                  {
                    color: isSelected
                      ? colors.text.inverse
                      : colors.text.primary,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};