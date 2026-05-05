import React, { useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { CalendarSection } from "@/components/home/Calendar";
import Donut from "@/components/tracker/Donut";

export default function TrackerScreen() {
  const { colors } = useTheme();

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);

  const [nutrition, setNutrition] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [tab, setTab] = useState<"nutrition" | "activity">("nutrition");

  // ✅ норм дата (без timezone багов)
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${
      String(today.getMonth() + 1).padStart(2, "0")
    }-${String(today.getDate()).padStart(2, "0")}`
  );

  const [loading, setLoading] = useState(true);

  // 🔥 грузим только при смене PET
  const load = async () => {
    try {
      setLoading(true);

      const petsRes = await api.get("/pet-management/api/pets");
      const petsData = petsRes.data.map((p: any) => p.pet ?? p);

      setPets(petsData);

      let petId = selectedPet;

      if (!petId && petsData.length > 0) {
        petId = petsData[0].id;
        setSelectedPet(petId);
      }

      if (petId) {
        const [nutRes, actRes] = await Promise.all([
          api.get(`/pet-management/api/nutrition/pet/${petId}`),
          api.get(`/pet-management/api/activities/pet/${petId}`),
        ]);

        setNutrition(nutRes.data || []);
        setActivities(actRes.data || []);
      }
    } catch (e) {
      console.log("ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [selectedPet])
  );

  // 🔥 мгновенный фильтр (без API)
const filteredNutrition = nutrition.filter(
  (n) => n.date?.slice(0, 10) === selectedDate
);

const filteredActivities = activities.filter(
  (a) => a.date?.slice(0, 10) === selectedDate
);
console.log("nutrition:", nutrition);
console.log("selectedDate:", selectedDate);

  // 🔥 donut
  const totalCalories = filteredNutrition.reduce((sum, n) => {
  const match = n.summary?.match(/(\d+(\.\d+)?)/);
  return sum + (match ? parseFloat(match[0]) : 0);
}, 0);

  const totalActivity = filteredActivities.length * 10;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* 🐾 PET SELECT */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              onPress={() => setSelectedPet(pet.id)}
              style={{ alignItems: "center", marginRight: 14 }}
            >
              <Image
                source={{
                  uri:
                    pet.avatarUrl ||
                    "https://cdn-icons-png.flaticon.com/512/616/616408.png",
                }}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: selectedPet === pet.id ? 3 : 0,
                  borderColor: colors.primary.main,
                }}
              />
              <Text>{pet.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TITLE */}
        <Text style={{ fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 20 }}>
          {tab === "nutrition" ? "Nutrition Tracker" : "Activity Tracker"}
        </Text>

        {/* TABS */}
        <View style={{
          flexDirection: "row",
          borderRadius: 30,
          padding: 4,
          marginBottom: 16,
          backgroundColor: colors.card.elevated,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 25,
              alignItems: "center",
              backgroundColor: tab === "nutrition" ? colors.primary.main : "transparent",
            }}
            onPress={() => setTab("nutrition")}
          >
            <Text style={{ color: tab === "nutrition" ? "#fff" : colors.text.secondary }}>
              Nutrition
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 25,
              alignItems: "center",
              backgroundColor: tab === "activity" ? colors.primary.main : "transparent",
            }}
            onPress={() => setTab("activity")}
          >
            <Text style={{ color: tab === "activity" ? "#fff" : colors.text.secondary }}>
              Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* CALENDAR */}
        <CalendarSection
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* DONUT */}
        <View style={{ marginBottom: 20 }}>
          <Donut
            value={tab === "nutrition" ? totalCalories : totalActivity}
            max={tab === "nutrition" ? 2000 : 100}
          />
        </View>

        {/* LIST */}
        {tab === "nutrition" ? (
          <>
            {filteredNutrition.map((n) => (
              <View key={n.logId} style={{
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                backgroundColor: colors.card.elevated,
              }}>
                <Text>{n.summary}</Text>
                <Text style={{ opacity: 0.6 }}>
                  {n.foodItems?.join(", ")}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              style={{
                padding: 14,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: colors.tracker.primary,
              }}
              onPress={() =>
                router.push(`/nutrition-form?petId=${selectedPet}`)
              }
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                + Add Nutrition
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {filteredActivities.map((a) => (
              <View key={a.activityId} style={{
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                backgroundColor: colors.card.elevated,
              }}>
                <Text>{a.summary}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={{
                padding: 14,
                borderRadius: 16,
                alignItems: "center",
                backgroundColor: colors.tracker.primary,
              }}
              onPress={() =>
                router.push(`/activity-form?petId=${selectedPet}`)
              }
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                + Add Activity
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}