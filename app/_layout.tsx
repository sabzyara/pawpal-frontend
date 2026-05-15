// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { Stack } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import "react-native-reanimated";


// import { useAuthStore } from "@/store/authStore";
// import { useThemeStore } from '@/store/themeStore';
// import { useEffect } from "react";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';




// export default function RootLayout() {

//   const loadUser = useAuthStore(state => state.loadUser); 

//   useEffect(() => {
//     loadUser();
//   }, []);

//   const theme = useThemeStore((s) => s.theme);

//   const loadTheme = useThemeStore((s) => s.loadTheme);

//   useEffect(() => {
//     loadTheme();
//   }, []);

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        
//           <Stack>
//             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//             <Stack.Screen
//               name="modal"
//               options={{ presentation: "modal", title: "Modal" }}
//             />

//        <Stack.Screen
//   name="nutrition-form"
//   options={{
//     presentation: "transparentModal",
//     animation: "none",
//     headerShown: false,

//     contentStyle: {
//       backgroundColor: "transparent",
//     },
//   }}
// />

// <Stack.Screen
//   name="activity-form"
//   options={{
//     presentation: "transparentModal",
//     animation: "none",
//     headerShown: false,

//     contentStyle: {
//       backgroundColor: "transparent",
//     },
//   }}
// />

//           </Stack>
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </GestureHandlerRootView>
//   );
// }

// import { useAuthStore } from "@/store/authStore";
// import { Redirect, Stack, useSegments } from "expo-router";

// export default function RootLayout() {
//   const { user, isLoading } = useAuthStore();

//   const segments = useSegments();

//   if (isLoading) return null;

//   const inAuthGroup = segments[0] === "(auth)";
//   const inOwnerGroup = segments[0] === "(owner)";
//   const inAdminGroup = segments[0] === "(admin)";
//   const inSpecialistGroup = segments[0] === "(specialist)";

//   if (!user && !inAuthGroup) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   if (user?.role === "OWNER" && !inOwnerGroup) {
//     return <Redirect href="/(owner)" />;
//   }

//   if (user?.role === "ADMIN" && !inAdminGroup) {
//     return <Redirect href="/(admin)/admin-main" />;
//   }

//   if (
//     (user?.role === "VET" || user?.role === "SERVICE") &&
//     !inSpecialistGroup
//   ) {
//     return <Redirect href="/(specialist)/vet-profile" />;
//   }

//   return <Stack />;
// }

// import { Stack } from "expo-router";
// import { GestureHandlerRootView } from "react-native-gesture-handler";

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Stack screenOptions={{ headerShown: false }} />
//     </GestureHandlerRootView>
//   );
// }
import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack, useSegments } from "expo-router";

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();

  const segments = useSegments();

  const inAuthGroup = segments[0] === "(auth)";

  if (isLoading) return null;

  if (!user && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
