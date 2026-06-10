// app/_layout.tsx
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./i18n";

function LoadingScreen() {

  const { colors } = useTheme();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
<<<<<<< HEAD
      <ActivityIndicator color={colors.text.inverse} />
=======
      <ActivityIndicator size="large" color="#E3275B" />
>>>>>>> 10a7ed855c8615006cbc60f507ee9059125765b7
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