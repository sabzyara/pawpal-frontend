import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";

import { useTheme } from "@/hooks/useTheme";

export default function SpecialistTabs() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.border.light,

          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 10,

          height: Platform.OS === "ios" ? 85 : 65,
        },

        tabBarActiveTintColor: colors.icon.active,
        tabBarInactiveTintColor: colors.icon.inactive,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="vets-list"
        options={{
          title: "Список",

          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>
              📅
            </Text>
          ),
        }}
      />

      {/* <Tabs.Screen
        name="chat"
        options={{
          title: "Чат",

          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>
              💬
            </Text>
          ),
        }}
      /> */}

      <Tabs.Screen
        name="vet-profile"
        options={{
          title: "Профиль",

          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>
              👤
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}