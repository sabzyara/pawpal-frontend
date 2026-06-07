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
import "./i18n";
import { useTranslation } from "react-i18next";


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
  const { t } = useTranslation();
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
    { key: "dog", label: t("addPet.dog") },
    { key: "cat", label: t("addPet.cat") },
    { key: "fish", label: t("addPet.fish") },
    { key: "hamster", label: t("addPet.hamster") },
    { key: "parrot", label: t("addPet.parrot") },
    { key: "rabbit", label: t("addPet.rabbit") },
    { key: "turtle", label: t("addPet.turtle") },
    { key: "other", label: t("addPet.other") },
  ];

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [breeds, setBreeds] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [speciesModalVisible, setSpeciesModalVisible] = useState(false);

  const filteredBreeds = breeds.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpeciesChange = (value: string) => {
    handleInputChange("species", value);

    handleInputChange("breed", "");

    if (value === "dog" || value === "cat") {
      loadBreeds(value); 
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

  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };


  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert(t("addPet.Error"), t("addPet.Please fill in all fields"));
      return;
    }

    try {
      setLoading(true);


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

      Alert.alert(t("addPet.Success"), t("addPet.Pet added successfully"), [
        { text: "OK", onPress: () => router.back() },
      ]);

    } catch (e: any) {
      console.log("ERROR:", e?.response?.data);

      Alert.alert(t("addPet.Error"), t("addPet.Error creating pet"));
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
        
      
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>t("addPet.title")</Text>
        </View>

        <ScrollView>

          <TouchableOpacity onPress={pickImage} style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={{
                uri:
                  image ||
                  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
              }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text style={{ marginTop: 8 }}>t("addPet.addPhoto")</Text>
          </TouchableOpacity>


          <TextInput
            placeholder={t("addPet.name")}
            placeholderTextColor={colors.text.tertiary}
            value={formData.name}
            onChangeText={(v) => handleInputChange("name", v)}
            style={styles.input}
          />

          <TouchableOpacity
            style={styles.selectBox}
            onPress={() => setSpeciesModalVisible(true)}
          >
            <Text
              style={{
                color: formData.species
                  ? colors.text.primary
                  : colors.text.tertiary,
              }}
            >
              {formData.species
                ? speciesList.find((s) => s.key === formData.species)?.label
                : t("addPet.selectSpecies")}
            </Text>

            <Feather
              name="chevron-down"
              size={20}
              color={colors.text.secondary}
            />

            <Modal visible={speciesModalVisible} animationType="slide">
              <SafeAreaView
                style={{
                  flex: 1,
                  backgroundColor: colors.background.primary,
                  padding: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 24,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setSpeciesModalVisible(false)}
                  >
                    <Feather
                      name="arrow-left"
                      size={24}
                      color={colors.text.primary}
                    />
                  </TouchableOpacity>

                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "700",
                      marginLeft: 16,
                      color: colors.text.primary,
                    }}
                  >
                    {t("addPet.selectSpecies")}
                  </Text>
                </View>

                <FlatList
                  data={speciesList}
                  keyExtractor={(item) => item.key}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        handleSpeciesChange(item.key);
                        setSpeciesModalVisible(false);
                      }}
                      style={{
                        paddingVertical: 18,
                        paddingHorizontal: 16,
                        borderRadius: 16,
                        marginBottom: 12,
                        backgroundColor:
                          formData.species === item.key
                            ? colors.primary.main
                            : colors.card.default,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color:
                            formData.species === item.key
                              ? "#fff"
                              : colors.text.primary,
                          fontWeight: "600",
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </SafeAreaView>
            </Modal>
          </TouchableOpacity>

          {formData.species === "dog" ||
          formData.species === "cat" ? (
            <>
              <TouchableOpacity
                onPress={() => setDropdownVisible(true)}
                style={styles.selectBox}
              >
                <Text
                  style={{
                    color: formData.breed
                      ? colors.text.primary
                      : colors.text.tertiary,
                  }}
                >
                  {formData.breed || t("addPet.selectBreed")}
                </Text>

                <Feather
                  name="chevron-down"
                  size={20}
                  color={colors.text.secondary}
                />

             
                <Modal visible={dropdownVisible} animationType="slide">
                  <SafeAreaView
                    style={{
                      flex: 1,
                      backgroundColor: colors.background.primary,
                      padding: 20,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 24,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setDropdownVisible(false)}
                      >
                        <Feather
                          name="arrow-left"
                          size={24}
                          color={colors.text.primary}
                        />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 22,
                          fontWeight: "700",
                          marginLeft: 16,
                          color: colors.text.primary,
                        }}
                      >
                        {t("addPet.selectBreed")}
                      </Text>
                    </View>

                    <TextInput
                      placeholder={t("addPet.searchBreed")}
                      placeholderTextColor={colors.text.tertiary}
                      value={search}
                      onChangeText={setSearch}
                      style={styles.input}
                    />


                    <FlatList
                      data={filteredBreeds}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            handleInputChange("breed", item.name);
                            setDropdownVisible(false);
                          }}
                          style={{
                            paddingVertical: 18,
                            borderBottomWidth: 1,
                            borderColor: colors.border.light,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              color: colors.text.primary,
                            }}
                          >
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </SafeAreaView>
                </Modal>
              </TouchableOpacity>
            </>
          ) : formData.species ? (
            <TextInput
              placeholder={t("addPet.breed")}
              placeholderTextColor={colors.text.tertiary}
              value={formData.breed}
              onChangeText={(v) => handleInputChange("breed", v)}
              style={styles.input}
            />
          ) : null}
          

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
                {t("addPet.male")}
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
                {t("addPet.female")}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder={t("addPet.age")}
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(v) => handleInputChange("age", v)}
            style={styles.input}
          />

          <TextInput
            placeholder={t("addPet.weight")}
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={(v) => handleInputChange("weight", v)}
            style={styles.input}
          />

          <TextInput
            placeholder={t("addPet.healthStatus")}
            placeholderTextColor={colors.text.tertiary}
            value={formData.healthStatus}
            onChangeText={(v) => handleInputChange("healthStatus", v)}
            style={styles.input}
          />


          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <LinearGradient
              colors={colors.primary.gradient}
              style={styles.button}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t("addPet.addPet")}
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

  selectBox: {
    backgroundColor: colors.input.background,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.input.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});