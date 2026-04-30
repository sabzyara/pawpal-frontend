import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import api from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function EditPetScreen() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState<any>(null);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [health, setHealth] = useState("");

  // 🔥 загрузка питомца
  useEffect(() => {
    if (!id) return;

    api
      .get(`/pet-management/api/pets/pet/${id}/full`)
      .then((res) => {
        const p = res.data.pet;

        setPet(p);
        setName(p.name || "");
        setSpecies(p.species || "");
        setBreed(p.breed || "");
        setGender(p.gender || "");
        setAge(String(p.age || ""));
        setWeight(String(p.weight || ""));
        setHealth(p.healthStatus || "");
      })
      .catch(() => {
        Alert.alert("Ошибка загрузки");
      });
  }, [id]);

  // 🔥 загрузка аватара
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Нет доступа к галерее");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (result.canceled) return;

    const image = result.assets[0];

    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      await api.post(
        `/pet-management/api/pets/${id}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 🔥 обновить экран
      setPet((prev: any) => ({
        ...prev,
        avatarUrl: image.uri,
      }));
    } catch (e) {
      Alert.alert("Ошибка загрузки фото");
    }
  };

  // 🔥 сохранение
  const handleSave = async () => {
    try {
      setLoading(true);

      await api.put(`/pet-management/api/pets/${id}`, {
        name,
        species,
        breed,
        gender,
        age: Number(age),
        weight: Number(weight),
        healthStatus: health,
      });

      Alert.alert("Успех", "Питомец обновлен");
      router.back();
    } catch (e) {
      Alert.alert("Ошибка обновления");
    } finally {
      setLoading(false);
    }
  };

  if (!pet) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.back}>←</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.title}>
            Edit Pet
          </ThemedText>

          <View style={{ width: 40 }} />
        </View>

        {/* AVATAR */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage}>
            <Image
              source={{
                uri:
                  pet.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
              }}
              style={styles.avatar}
            />

            <View style={styles.editBadge}>
              <ThemedText style={{ color: "#fff" }}>
                Edit
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />
          <TextInput value={species} onChangeText={setSpecies} placeholder="Species" style={styles.input} />
          <TextInput value={breed} onChangeText={setBreed} placeholder="Breed" style={styles.input} />
          <TextInput value={gender} onChangeText={setGender} placeholder="Gender" style={styles.input} />
          <TextInput value={age} onChangeText={setAge} placeholder="Age" style={styles.input} />
          <TextInput value={weight} onChangeText={setWeight} placeholder="Weight" style={styles.input} />
          <TextInput value={health} onChangeText={setHealth} placeholder="Health" style={styles.input} />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                Save
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F6FA",
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  back: {
    fontSize: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    padding: 6,
    borderRadius: 10,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
  },
  button: {
    backgroundColor: "#FF6B6B",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});