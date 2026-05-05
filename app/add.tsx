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
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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

  const speciesList = [
    { key: "dog", label: "Dog 🐶" },
    { key: "cat", label: "Cat 🐱" },
    { key: "fish", label: "Fish 🐟" },
    { key: "hamster", label: "Hamster 🐹" },
    { key: "parrot", label: "Parrot 🦜" },
    { key: "rabbit", label: "Rabbit 🐰" },
    { key: "turtle", label: "Turtle 🐢" },
    { key: "other", label: "Other 🐾" },
  ];

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [breeds, setBreeds] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const filteredBreeds = breeds.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpeciesChange = (value: string) => {
    handleInputChange("species", value);

    handleInputChange("breed", "");

    if (value === "dog" || value === "cat") {
      loadBreeds(value); // API
    } else {
      setBreeds([]); 
    }
  };

  const loadBreeds = async (species: string) => {
  try {
    const res = await api.get(`/pet-management/api/breeds?species=${species}`);
    setBreeds(res.data);
  } catch (e) {
    console.log("BREEDS ERROR", e);
  }
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

  // useEffect(() => {
  //   const delay = setTimeout(() => {
  //     // можно дергать API если хочешь серверный поиск
  //   }, 300);

  //   return () => clearTimeout(delay);
  // }, [search]);

  

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

          {/* <TextInput
            placeholder="Species"
            placeholderTextColor={colors.text.tertiary}
            value={formData.species}
            onChangeText={(v) => handleInputChange("species", v)}
            style={styles.input}
          /> */}
          <View style={{ marginBottom: 12 }}>
            {speciesList.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => handleSpeciesChange(s.key)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 6,
                  backgroundColor:
                    formData.species === s.key ? "#4CAF50" : "#eee",
                }}
              >
                <Text>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* <TextInput
            placeholder="Breed"
            placeholderTextColor={colors.text.tertiary}
            value={formData.breed}
            onChangeText={(v) => handleInputChange("breed", v)}
            style={styles.input}
          /> */}

          {/* BREED SELECT */}
          {(formData.species === "dog" || formData.species === "cat") && (
            <>
              {/* КНОПКА */}
              <TouchableOpacity
                onPress={() => setDropdownVisible(true)}
                style={styles.input}
              >
                <Text>
                  {formData.breed ? formData.breed : "Select breed"}
                </Text>
                <Feather name="chevron-down" size={18} />
              </TouchableOpacity>

              {/* МОДАЛКА */}
              <Modal visible={dropdownVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, padding: 16 }}>

                  {/* HEADER */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Select Breed
                    </Text>

                    <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                      <Text style={{ color: "red" }}>Close</Text>
                    </TouchableOpacity>
                  </View>

                  {/* SEARCH */}
                  <TextInput
                    placeholder="Search breed..."
                    value={search}
                    onChangeText={setSearch}
                    style={[styles.input, { marginTop: 12 }]}
                  />

                  {/* LIST */}
                  <FlatList
                    data={filteredBreeds}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          handleInputChange("breed", item.name);
                          setDropdownVisible(false);
                        }}
                        style={{
                          padding: 14,
                          borderBottomWidth: 1,
                          borderColor: "#eee",
                        }}
                      >
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </SafeAreaView>
              </Modal>
            </>
          )}

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