import { usePets } from "@/store/petStore";
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
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { addPetStyles } from "@/styles/addScreenStyles";

const { width, height } = Dimensions.get("window");

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
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addPet } = usePets();

  const handleInputChange = (field: keyof PetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your pet's name");
      return;
    }

    addPet(formData.name.trim());
    
    Alert.alert(
      "Success! 🎉",
      `${formData.name} has been added to your family`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const handleCancel = () => {
    if (formData.name || formData.species || formData.breed) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const renderGenderButton = (gender: "male" | "female", label: string, emoji: string) => (
    <TouchableOpacity
      style={[
        addPetStyles.genderButton,
        formData.gender === gender && addPetStyles.genderButtonActive,
      ]}
      onPress={() => handleInputChange("gender", gender)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          formData.gender === gender
            ? (gender === "male" ? ["#4ECDC4", "#6BE4DC"] : ["#FF6B6B", "#FF8E8E"])
            : ["#F8F9FA", "#F8F9FA"]
        }
        style={addPetStyles.genderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={addPetStyles.genderEmoji}>{emoji}</Text>
        <Text
          style={[
            addPetStyles.genderText,
            formData.gender === gender && addPetStyles.genderTextActive,
          ]}
        >
          {label}
        </Text>
        {formData.gender === gender && (
          <View style={addPetStyles.checkmark}>
            <Feather name="check" size={12} color="#FFF" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={addPetStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={addPetStyles.keyboardView}
        >
          <SafeAreaView style={addPetStyles.safeArea}>
            {/* Header */}
            <View style={addPetStyles.header}>
              <TouchableOpacity onPress={handleCancel} style={addPetStyles.backButton}>
                <Feather name="arrow-left" size={24} color="#1A1A1A" />
              </TouchableOpacity>
              <Text style={addPetStyles.headerTitle}>Add New Pet</Text>
              <View style={addPetStyles.placeholder} />
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={addPetStyles.scrollContent}
            >
              {/* Pet Avatar Section */}
              <View style={addPetStyles.avatarSection}>
                <TouchableOpacity 
                  style={addPetStyles.avatarContainer}
                  onPress={() => {
                    // Add image picker functionality here
                    Alert.alert("Coming Soon", "Photo picker will be available soon");
                  }}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E8E"]}
                    style={addPetStyles.avatarGradient}
                  >
                    {selectedImage ? (
                      <Image source={{ uri: selectedImage }} style={addPetStyles.avatar} />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="camera-plus" size={32} color="#FFF" />
                        <Text style={addPetStyles.avatarText}>Add Photo</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Welcome Card */}
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                style={addPetStyles.welcomeCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="paw" size={32} color="#FFF" />
                <Text style={addPetStyles.welcomeTitle}>New Family Member 🐾</Text>
                <Text style={addPetStyles.welcomeSubtitle}>
                  Tell us about your pet to provide the best care
                </Text>
              </LinearGradient>

              {/* Form Section */}
              <View style={addPetStyles.formSection}>
                <Text style={addPetStyles.sectionTitle}>Basic Information</Text>
                
                {/* Pet Name */}
                <View style={addPetStyles.inputWrapper}>
                  <View style={addPetStyles.inputHeader}>
                    <MaterialCommunityIcons name="tag" size={20} color="#FF6B6B" />
                    <Text style={addPetStyles.label}>
                      Pet Name <Text style={addPetStyles.required}>*</Text>
                    </Text>
                  </View>
                  <TextInput
                    value={formData.name}
                    onChangeText={(value) => handleInputChange("name", value)}
                    placeholder="e.g., Max, Luna, Charlie"
                    placeholderTextColor="#B6CAEB"
                    style={addPetStyles.input}
                  />
                </View>

                {/* Species & Breed Row */}
                <View style={addPetStyles.row}>
                  <View style={[addPetStyles.inputWrapper, addPetStyles.halfWidth]}>
                    <View style={addPetStyles.inputHeader}>
                      <MaterialCommunityIcons name="dog" size={20} color="#4ECDC4" />
                      <Text style={addPetStyles.label}>Species</Text>
                    </View>
                    <TextInput
                      value={formData.species}
                      onChangeText={(value) => handleInputChange("species", value)}
                      placeholder="Dog, Cat, Bird"
                      placeholderTextColor="#B6CAEB"
                      style={addPetStyles.input}
                    />
                  </View>

                  <View style={[addPetStyles.inputWrapper, addPetStyles.halfWidth]}>
                    <View style={addPetStyles.inputHeader}>
                      <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#FFE66D" />
                      <Text style={addPetStyles.label}>Breed</Text>
                    </View>
                    <TextInput
                      value={formData.breed}
                      onChangeText={(value) => handleInputChange("breed", value)}
                      placeholder="Labrador, Persian"
                      placeholderTextColor="#B6CAEB"
                      style={addPetStyles.input}
                    />
                  </View>
                </View>

                {/* Gender Section */}
                <View style={addPetStyles.inputWrapper}>
                  <View style={addPetStyles.inputHeader}>
                    <MaterialCommunityIcons name="gender-male-female" size={20} color="#A8E6CF" />
                    <Text style={addPetStyles.label}>Gender</Text>
                  </View>
                  <View style={addPetStyles.genderContainer}>
                    {renderGenderButton("male", "Male", "🐶")}
                    {renderGenderButton("female", "Female", "🐱")}
                  </View>
                </View>

                {/* Age & Weight Row */}
                <View style={addPetStyles.row}>
                  <View style={[addPetStyles.inputWrapper, addPetStyles.halfWidth]}>
                    <View style={addPetStyles.inputHeader}>
                      <MaterialCommunityIcons name="cake-variant" size={20} color="#FF9A9E" />
                      <Text style={addPetStyles.label}>Age (years)</Text>
                    </View>
                    <TextInput
                      value={formData.age}
                      onChangeText={(value) => handleInputChange("age", value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#B6CAEB"
                      style={addPetStyles.input}
                    />
                  </View>

                  <View style={[addPetStyles.inputWrapper, addPetStyles.halfWidth]}>
                    <View style={addPetStyles.inputHeader}>
                      <MaterialCommunityIcons name="weight" size={20} color="#FECFEF" />
                      <Text style={addPetStyles.label}>Weight (kg)</Text>
                    </View>
                    <TextInput
                      value={formData.weight}
                      onChangeText={(value) => handleInputChange("weight", value)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#B6CAEB"
                      style={addPetStyles.input}
                    />
                  </View>
                </View>

                {/* Health Status */}
                <View style={addPetStyles.inputWrapper}>
                  <View style={addPetStyles.inputHeader}>
                    <MaterialCommunityIcons name="heart-plus" size={20} color="#FF6B6B" />
                    <Text style={addPetStyles.label}>Health Status</Text>
                  </View>
                  <TextInput
                    value={formData.healthStatus}
                    onChangeText={(value) => handleInputChange("healthStatus", value)}
                    placeholder="Healthy, Under treatment, Allergies"
                    placeholderTextColor="#B6CAEB"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={addPetStyles.textArea}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={addPetStyles.buttonContainer}>
                <TouchableOpacity
                  style={addPetStyles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={addPetStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={addPetStyles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E8E"]}
                    style={addPetStyles.saveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Feather name="check" size={20} color="#FFF" />
                    <Text style={addPetStyles.saveButtonText}>Add Pet</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}