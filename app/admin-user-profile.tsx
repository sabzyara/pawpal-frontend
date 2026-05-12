import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AdminUserPage() {
  const { id, role } = useLocalSearchParams();
  const { colors } = useTheme();

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      let res;

      if (role === "PET_OWNER") {
        res = await api.get(`/pet-owner/${id}/full`);
      } else if (role === "VET") {
        res = await api.get(`/vet/${id}`);
      } else {
        res = await api.get(`/service-provider/${id}`);
      }

      setData(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  if (!data) {
    return <ActivityIndicator color={colors.primary.main} />;
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        {role}
      </Text>

      <Text>ID: {id}</Text>

      <Text>{JSON.stringify(data, null, 2)}</Text>
    </View>
  );
}