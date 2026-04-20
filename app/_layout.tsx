import { PetProvider } from "@/store/petStore";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from '@/store/themeStore';
import { useEffect } from "react";


export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {

  const loadUser = useAuthStore(state => state.loadUser); 

  useEffect(() => {
    loadUser();
  }, []);

  const { theme } = useTheme();

  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <PetProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />

          <Stack.Screen
            name="activity-form"
            options={{
              presentation: 'transparentModal', 
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="nutrition-form"
            options={{
              presentation: 'transparentModal',
              headerShown: false,
            }}
          />

        </Stack>
      </PetProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}