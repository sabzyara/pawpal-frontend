import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";


import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from '@/store/themeStore';
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';




export default function RootLayout() {

  const loadUser = useAuthStore(state => state.loadUser); 

  useEffect(() => {
    loadUser();
  }, []);

  const theme = useThemeStore((s) => s.theme);

  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />

       <Stack.Screen
  name="nutrition-form"
  options={{
    presentation: "transparentModal",
    animation: "none",
    headerShown: false,

    contentStyle: {
      backgroundColor: "transparent",
    },
  }}
/>

<Stack.Screen
  name="activity-form"
  options={{
    presentation: "transparentModal",
    animation: "none",
    headerShown: false,

    contentStyle: {
      backgroundColor: "transparent",
    },
  }}
/>

          </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}