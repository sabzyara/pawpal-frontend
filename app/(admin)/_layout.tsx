import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { useTheme } from "@/hooks/useTheme";

export default function AdminTabs() {
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
        name="admin-main"
        options={{
          title: "List",

          tabBarIcon: ({ color, size }) => (
            <Feather
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="admin-profile"
        options={{
          title: "Profile",

          tabBarIcon: ({ color, size }) => (
            <Feather
              name="user"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}