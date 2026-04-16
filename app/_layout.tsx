import { PetProvider } from "@/store/petStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore"; // 👈 ДОБАВИЛИ
import { useEffect } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const loadUser = useAuthStore(state => state.loadUser); // 👈 ДОБАВИЛИ

  useEffect(() => {
    loadUser(); // 👈 ВАЖНО
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <PetProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />

          <Stack.Screen
            name="add-activity"
            options={{
              presentation: 'transparentModal', 
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="add-nutrition"
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              // animation: 'none',
            }}
          />

        </Stack>
      </PetProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}