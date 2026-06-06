import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

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
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'Veterinarian', label: 'Vets', icon: 'medical-outline' },
    { id: 'Service Provider', label: 'Services', icon: 'cut-outline' },
  ];

  const iconColor = colors.primary.main; 

  return (
    <View
      style={{
        backgroundColor: colors.background.primary,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: 12,
        }}
      >
        <Text
          style={[
            typography.body1SemiBold,
            {
              color: colors.text.primary,
            },
          ]}
        >
          Categories
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
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
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 999,
                marginRight: 12,
                backgroundColor: isSelected
                  ? colors.primary.main
                  : colors.background.tertiary,
                borderWidth: isSelected ? 0 : 1,
                borderColor: colors.border.light,
                alignSelf: 'flex-start',
                
                ...(isSelected && {
                  shadowColor: colors.primary.main,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }),
              }}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={isSelected ? colors.text.inverse : iconColor}
              />
              <Text
                style={[
                  typography.body2,
                  {
                    fontWeight: isSelected ? '600' : '500',
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