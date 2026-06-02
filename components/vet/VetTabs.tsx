import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type TabType = 'about' | 'availability' | 'reviews' | 'edit' | 'manage';

interface VetTabsProps {
  active: TabType;
  onChange: (tab: TabType) => void;
  tabs?: TabType[];
  isOwner?: boolean;
}

const tabLabels: Record<TabType, string> = {
  about: 'О специалисте',
  availability: 'Расписание',
  reviews: 'Отзывы',
  edit: 'Редактировать',
  manage: 'Управление',
};

export const VetTabs: React.FC<VetTabsProps> = ({ 
  active, 
  onChange, 
  tabs = ['about', 'availability', 'reviews'],
  isOwner = false 
}) => {
  const { colors, typography, spacing } = useTheme();

  const displayTabs: TabType[] = React.useMemo(() => {
    if (isOwner) {
      const baseTabs = [...tabs];
      if (!baseTabs.includes('edit')) baseTabs.push('edit');
      if (!baseTabs.includes('manage')) baseTabs.push('manage');
      return baseTabs;
    }
    return tabs;
  }, [isOwner, tabs]);

  const currentActiveTab = displayTabs.includes(active) ? active : displayTabs[0];

  const handleTabPress = (tab: TabType) => {
    if (tab !== active) {
      onChange(tab);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: colors.background.tertiary,
        borderRadius: spacing.xl, 
        padding: spacing.xs, 
        marginBottom: spacing.md, 
        gap: spacing.xs, 
      }}
    >
      {displayTabs.map((tab) => {
        const isActive = tab === currentActiveTab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={{
              flex: 1,
              paddingVertical: spacing.xs, 
              paddingHorizontal: spacing.sm, 
              borderRadius: spacing.xl,
              backgroundColor: isActive ? colors.primary.main : 'transparent',
              minWidth: 100,
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