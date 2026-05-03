import { useTheme } from '@/hooks/useTheme';
import api from "@/services/api";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const { colors } = useTheme();
  const styles = createStyles(colors);

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
    <>
    <Stack.Screen options={{ headerShown: false }} />


    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Add Pet</Text>
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
            placeholderTextColor={colors.text.tertiary}
            value={formData.name}
            onChangeText={(v) => handleInputChange("name", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Species"
            placeholderTextColor={colors.text.tertiary}
            value={formData.species}
            onChangeText={(v) => handleInputChange("species", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Breed"
            placeholderTextColor={colors.text.tertiary}
            value={formData.breed}
            onChangeText={(v) => handleInputChange("breed", v)}
            style={styles.input}
          />

          {/* GENDER */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.genderBtn,
                formData.gender === "male" && styles.genderBtnActive,
              ]}
              onPress={() => handleInputChange("gender", "male")}
            >
              <Text
                style={
                  formData.gender === "male"
                    ? styles.genderTextActive
                    : styles.genderText
                }
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderBtn,
                formData.gender === "female" && styles.genderBtnActive,
              ]}
              onPress={() => handleInputChange("gender", "female")}
            >
              <Text
                style={
                  formData.gender === "female"
                    ? styles.genderTextActive
                    : styles.genderText
                }
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Age"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(v) => handleInputChange("age", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Weight"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(v) => handleInputChange("weight", v)}
            style={styles.input}
          />

          <TextInput
            placeholder="Health status"
            placeholderTextColor={colors.text.tertiary}
            value={formData.healthStatus}
            onChangeText={(v) => handleInputChange("healthStatus", v)}
            style={styles.input}
          />

          {/* SAVE */}
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <LinearGradient
              colors={colors.primary.gradient}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
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
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 16,
    color: colors.text.primary,
  },

  photoText: {
    marginTop: 8,
    color: colors.text.secondary,
  },

  input: {
    backgroundColor: colors.input.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.input.border,
    color: colors.text.primary,
  },

  genderBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.card.default,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.medium,
  },

  genderBtnActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },

  genderText: {
    color: colors.text.primary,
  },

  genderTextActive: {
    color: colors.text.inverse,
    fontWeight: "600",
  },

  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
});