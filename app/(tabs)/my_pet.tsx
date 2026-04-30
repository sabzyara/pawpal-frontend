import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import api from "@/services/api";

type Pet = {
  id: number;
  name: string;
  species?: string;
  avatarUrl?: string;
};

export default function MyPetsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await api.get("/pet-management/api/pets");

      const data = Array.isArray(res.data)
        ? res.data.map((p: any) => p.pet ?? p)
        : [];

      setPets(data);
    } catch (e) {
      console.log("ERROR:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔥 обновляется каждый раз при возврате
  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}

        // 🔥 HEADER
        ListHeaderComponent={
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "700" }}>
              My Pets 🐾
            </Text>

            <TouchableOpacity onPress={() => router.push("/add")}>
              <Feather name="plus" size={26} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        }

        // 🔥 EMPTY
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              No pets yet
            </Text>
            <TouchableOpacity onPress={() => router.push("/add")}>
              <Text style={{ color: "#FF6B6B" }}>Add your first pet</Text>
            </TouchableOpacity>
          </View>
        }

        // 🔥 ITEM
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/pet",
                params: { id: item.id },
              })
            }
            style={{ marginBottom: 16 }}
          >
            <LinearGradient
              colors={["#FF7A7A", "#FFB3B3"]}
              style={{
                borderRadius: 24,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                elevation: 5,
              }}
            >
              {/* LEFT */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{
                    uri:
                      item.avatarUrl ||
                      "https://cdn-icons-png.flaticon.com/512/616/616408.png",
                  }}
                  style={{
                    width: 65,
                    height: 65,
                    borderRadius: 32,
                    marginRight: 14,
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />

                <View>
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: "#fff",
                      opacity: 0.8,
                      marginTop: 4,
                    }}
                  >
                    {item.species || "Pet"}
                  </Text>
                </View>
              </View>

              {/* ARROW */}
              <Feather name="chevron-right" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}