// app/(tabs)/nutrition-form.tsx

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

export default function NutritionForm() {
  const { petId } = useLocalSearchParams();

  const [mealType, setMealType] = useState("");
  const [calories, setCalories] = useState("");
  const [food, setFood] = useState("");

  const submit = async () => {
    await api.post("/pet-management/api/nutrition", {
      petId: Number(petId),
      date: new Date().toISOString().split("T")[0],
      mealType,
      calories: Number(calories),
      foodItems: food.split(",").map((i) => i.trim()),
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Nutrition 🍽️</Text>

      <TextInput
        placeholder="Meal Type (BREAKFAST)"
        style={styles.input}
        value={mealType}
        onChangeText={setMealType}
      />

      <TextInput
        placeholder="Calories"
        style={styles.input}
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Food (Chicken, Rice)"
        style={styles.input}
        value={food}
        onChangeText={setFood}
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
  container: {
    flex: 1,
    padding: 20,
  },

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
    fontSize: 16,
  },
});