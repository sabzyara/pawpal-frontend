import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Redirect href="/(owner)" />;
  }

  return <Redirect href="/(auth)/login" />;
}