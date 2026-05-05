// app/(tabs)/activity-form.tsx

import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import api from "@/services/api";

export default function ActivityForm() {
  const { petId } = useLocalSearchParams();

  const [type, setType] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const submit = async () => {
    await api.post("/pet-management/api/activities", {
      petId: Number(petId),
      date: new Date().toISOString().split("T")[0],
      activityType: type,
      distance: Number(distance),
      durationInMinutes: Number(duration),
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Activity 🐾</Text>

      <TextInput
        placeholder="Activity Type (Walk)"
        style={styles.input}
        value={type}
        onChangeText={setType}
      />

      <TextInput
        placeholder="Distance (km)"
        style={styles.input}
        value={distance}
        onChangeText={setDistance}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Duration (minutes)"
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />

      <TouchableOpacity onPress={submit}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E8E"]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#f3f3f3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  button: {
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});