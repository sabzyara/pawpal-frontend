import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  gender: "male" | "female" | "";
  age: string;
  weight: string;
  healthStatus: string;
}

export default function AddPetScreen() {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    gender: "",
    age: "",
    weight: "",
    healthStatus: "",
  });

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 📸 выбрать фото
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 💾 сохранить
  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Введите имя питомца");
      return;
    }

    try {
      setLoading(true);

      // 1. создаём питомца
      const res = await api.post("/pet-management/api/pets", {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        gender: formData.gender,
        age: Number(formData.age) || 0,
        weight: Number(formData.weight) || 0,
        healthStatus: formData.healthStatus,
      });

      const petId = res.data.id;

      // 2. загружаем фото
      if (image) {
        const formDataImg = new FormData();

        formDataImg.append("file", {
          uri: image,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);

        await api.post(
          `/pet-management/api/pets/${petId}/avatar`,
          formDataImg,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      Alert.alert("Success 🎉", "Питомец добавлен", [
        { text: "OK", onPress: () => router.back() },
      ]);

    } catch (e: any) {
      console.log("ERROR:", e?.response?.data);

      Alert.alert("Ошибка", "Не удалось создать питомца");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} />
          </TouchableOpacity>

          <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 16 }}>
            Add Pet
          </Text>
        </View>

        <ScrollView>

          {/* 📸 PHOTO */}
          <TouchableOpacity onPress={pickImage} style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={{
                uri:
                  image ||
                  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
              }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text style={{ marginTop: 8 }}>Add photo</Text>
          </TouchableOpacity>

          {/* INPUTS */}
          <TextInput
            placeholder="Name"
            value={formData.name}
            onChangeText={(v) => handleInputChange("name", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Species"
            value={formData.species}
            onChangeText={(v) => handleInputChange("species", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Breed"
            value={formData.breed}
            onChangeText={(v) => handleInputChange("breed", v)}
            style={styles.input}
          />

          {/* GENDER */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                formData.gender === "male" && { backgroundColor: "#4ECDC4" },
              ]}
              onPress={() => handleInputChange("gender", "male")}
            >
              <Text>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderBtn,
                formData.gender === "female" && { backgroundColor: "#FF6B6B" },
              ]}
              onPress={() => handleInputChange("gender", "female")}
            >
              <Text>Female</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Age"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(v) => handleInputChange("age", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Weight"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(v) => handleInputChange("weight", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Health status"
            value={formData.healthStatus}
            onChangeText={(v) => handleInputChange("healthStatus", v)}
            style={styles.input}
          />

          {/* SAVE */}
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <LinearGradient
              colors={["#FF6B6B", "#FF8E8E"]}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Add Pet
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  input: {
    backgroundColor: "#f3f3f3",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
  },
};