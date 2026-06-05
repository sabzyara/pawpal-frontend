import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      const token =
        await AsyncStorage.getItem("token");

      console.log("TOKEN:", token);

      if (token) {
        router.replace("/(owner)");
      } else {
        router.replace("/(auth)/login");
      }
    };

    checkAuth();
  }, []);

  return null;
}