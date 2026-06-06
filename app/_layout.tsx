import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./i18n";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>

        {/* AUTH */}
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />

        {/* OWNER */}
        <Stack.Screen
          name="(owner)"
          options={{ headerShown: false }}
        />

        {/* ADMIN */}
        <Stack.Screen
          name="(admin)"
          options={{ headerShown: false }}
        />

        {/* SPECIALIST */}
        <Stack.Screen
          name="(specialist)"
          options={{ headerShown: false }}
        />

        {/* MODALS */}
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
          }}
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
    </GestureHandlerRootView>
  );
}