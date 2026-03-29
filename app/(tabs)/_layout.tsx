import { Tabs } from "expo-router";
import { TouchableOpacity, Platform, Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarActiveTintColor: '#9AAB63',
        tabBarInactiveTintColor: '#999999',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24, color }}>
              {focused ? '🏠' : '🏠'}
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24, color }}>
              {focused ? '👤' : '👤'}
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}