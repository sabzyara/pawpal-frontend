import { CalendarSection } from "@/components/home/Calendar";
import Donut from "@/components/tracker/Donut";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback,useEffect, useState, } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrackerScreen() {
  const { colors } = useTheme();

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);

  const [nutrition, setNutrition] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [tab, setTab] = useState<"nutrition" | "activity">("nutrition");

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${
      String(today.getMonth() + 1).padStart(2, "0")
    }-${String(today.getDate()).padStart(2, "0")}`
  );

  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const petsRes = await api.get("/pet-management/api/pets");
      const petsData = petsRes.data.map((p: any) => p.pet ?? p);

      setPets(petsData);

      let petId = selectedPet;

      if (!petId && petsData.length > 0) {
  petId = petsData[0].id;

  setSelectedPet((prev) => {
    if (prev === petId) return prev;
    return petId;
  });
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
  }, [])
);

if (pets.length === 0) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>
        You don't have any pets yet
      </Text>
    </View>
  );
}

const filteredNutrition = nutrition.filter(
  (n) => n.date?.slice(0, 10) === selectedDate
);

const filteredActivities = activities.filter(
  (a) => a.date?.slice(0, 10) === selectedDate
);
console.log("nutrition:", nutrition);
console.log("selectedDate:", selectedDate);

  const totalCalories = filteredNutrition.reduce((sum, n) => {
  const match = n.summary?.match(/(\d+(\.\d+)?)/);
  return sum + (match ? parseFloat(match[0]) : 0);
}, 0);

  const totalActivity = filteredActivities.length * 10;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary.main}
        />

        <Text
          style={{
            marginTop: 16,
            fontSize: 15,
            color: colors.text.secondary,
            fontWeight: "500",
          }}
        >
          Loading tracker...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary, }}>
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
              <Text style={{ color: colors.text.primary }}>
              {pet.name}
          </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TITLE */}
        <Text style={{ fontSize: 26, fontWeight: "700", textAlign: "center", marginTop: 20,  marginBottom: 20, color: colors.text.primary }}>
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
            <Text style={{ fontWeight: "700", fontSize: 16, color: tab === "nutrition" ? "#fff" : colors.text.secondary }}>
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
            <Text style={{ fontWeight: "700", fontSize: 16, color: tab === "activity" ? "#fff" : colors.text.secondary }}>
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
                <Text style={{ color: colors.text.primary }}>
  {n.summary}
</Text>
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
                <Text style={{ color: colors.text.primary }}>
                {a.summary}
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