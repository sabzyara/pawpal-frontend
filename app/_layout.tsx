import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>

        {/* Groups */}
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(owner)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(admin)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(specialist)"
          options={{ headerShown: false }}
        />

        {/* Modals */}
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