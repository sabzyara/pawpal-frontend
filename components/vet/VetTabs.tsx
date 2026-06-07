import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from "react-i18next";
import "@/app/i18n";


type TabType =
  | 'about'
  | 'availability'
  | 'reviews'
  | 'edit'
  | 'manage';

interface VetTabsProps {
  active: TabType;
  onChange: (tab: TabType) => void;
  tabs?: TabType[];
  isOwner?: boolean;
}

const tabLabels: Record<TabType, string> = {
  about: t("tabs.about"),
  availability: t("tabs.availability"),
  reviews: t("tabs.reviews"),
  edit: t("tabs.edit"),
  manage: t("tabs.manage"),
};

const tabIcons: Record<
  TabType,
  keyof typeof Ionicons.glyphMap
> = {
  about: 'person-outline',
  availability: 'calendar-outline',
  reviews: 'star-outline',
  edit: 'create-outline',
  manage: 'settings-outline',
};

export const VetTabs: React.FC<VetTabsProps> = ({
  active,
  onChange,
  tabs = ['about', 'availability', 'reviews'],
  isOwner = false,
}) => {
  const {
    colors,
    typography,
    spacing,
  } = useTheme();
  const { t } = useTranslation();
  const displayTabs: TabType[] =
    React.useMemo(() => {
      if (isOwner) {
        const baseTabs = [...tabs];

        if (
          !baseTabs.includes('edit')
        ) {
          baseTabs.push('edit');
        }

        if (
          !baseTabs.includes('manage')
        ) {
          baseTabs.push('manage');
        }

        return baseTabs;
      }

      return tabs;
    }, [isOwner, tabs]);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg,
      }}
    >
      {displayTabs.map((tab) => {
        const isActive =
          tab === active;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() =>
              onChange(tab)
            }
            style={{
              flex: 1,
              minWidth: 95,

              borderRadius: 18,

              paddingVertical:
                spacing.sm,

              backgroundColor:
                isActive
                  ? colors.primary.main
                  : colors.card.default,

              alignItems: 'center',

              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons
              name={tabIcons[tab]}
              size={18}
              color={
                isActive
                  ? colors.text.inverse
                  : colors.primary.main
              }
            />

            <Text
              style={[
                typography.caption,
                {
                  marginTop: 4,
                  textAlign: 'center',
                  color: isActive
                    ? colors.text.inverse
                    : colors.text.primary,
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