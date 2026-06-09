// app/_layout.tsx
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { View, ActivityIndicator } from "react-native";
import "./i18n";

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#E3275B" />
    </View>
  );
}

export default function RootLayout() {
  const { initialize, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(owner)" options={{ headerShown: false }} />
        <Stack.Screen name="(specialist)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />

        <Stack.Screen name="complete_profile" options={{ headerShown: false }} />
        <Stack.Screen name="complete_vet" options={{ headerShown: false }} />
        <Stack.Screen name="complete_service" options={{ headerShown: false }} />

        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="nutrition-form"
          options={{
            presentation: "transparentModal",
            animation: "none",
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="activity-form"
          options={{
            presentation: "transparentModal",
            animation: "none",
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}