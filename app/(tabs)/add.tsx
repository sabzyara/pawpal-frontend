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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addScreenStyles } from "@/styles/addScreenStyles";

const { width, height } = Dimensions.get("window");

export default function AddScreen() {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  
  const { addPet } = usePets();

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, введите имя питомца");
      return;
    }

    addPet(name.trim());
    
    Alert.alert(
      "Успешно!",
      `Питомец ${name} добавлен`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={addScreenStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={addScreenStyles.keyboardView}
        >
          <View style={addScreenStyles.modalCard}>
            {/* Кнопка закрытия */}
            <TouchableOpacity style={addScreenStyles.closeIcon} onPress={handleCancel}>
              <Text style={addScreenStyles.closeIconText}>✕</Text>
            </TouchableOpacity>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={addScreenStyles.scrollContent}
            >
              {/* Заголовок */}
              <View style={addScreenStyles.header}>
                <Text style={addScreenStyles.headerEmoji}>🐾</Text>
                <Text style={addScreenStyles.headerTitle}>Добавить питомца</Text>
                <Text style={addScreenStyles.headerSubtitle}>
                  Заполните информацию о вашем любимце
                </Text>
              </View>

              <View style={addScreenStyles.form}>
                {/* Имя питомца */}
                <View style={addScreenStyles.inputGroup}>
                  <Text style={addScreenStyles.label}>
                    Имя питомца <Text style={addScreenStyles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Например: Бобик, Мурка"
                    placeholderTextColor="#B6CAEB"
                    style={addScreenStyles.input}
                  />
                </View>

                {/* Вид */}
                <View style={addScreenStyles.inputGroup}>
                  <Text style={addScreenStyles.label}>Вид</Text>
                  <TextInput
                    value={species}
                    onChangeText={setSpecies}
                    placeholder="Собака, Кошка, Птица и т.д."
                    placeholderTextColor="#B6CAEB"
                    style={addScreenStyles.input}
                  />
                </View>

                {/* Порода */}
                <View style={addScreenStyles.inputGroup}>
                  <Text style={addScreenStyles.label}>Порода</Text>
                  <TextInput
                    value={breed}
                    onChangeText={setBreed}
                    placeholder="Например: Лабрадор, Мейн-кун"
                    placeholderTextColor="#B6CAEB"
                    style={addScreenStyles.input}
                  />
                </View>

                {/* Пол */}
                <View style={addScreenStyles.inputGroup}>
                  <Text style={addScreenStyles.label}>Пол</Text>
                  <View style={addScreenStyles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        addScreenStyles.genderButton,
                        gender === "male" && addScreenStyles.genderButtonActive,
                      ]}
                      onPress={() => setGender("male")}
                    >
                      <Text
                        style={[
                          addScreenStyles.genderText,
                          gender === "male" && addScreenStyles.genderTextActive,
                        ]}
                      >
                        🐶 Мальчик
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        addScreenStyles.genderButton,
                        gender === "female" && addScreenStyles.genderButtonActive,
                      ]}
                      onPress={() => setGender("female")}
                    >
                      <Text
                        style={[
                          addScreenStyles.genderText,
                          gender === "female" && addScreenStyles.genderTextActive,
                        ]}
                      >
                        🐱 Девочка
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Возраст и Вес */}
                <View style={addScreenStyles.row}>
                  <View style={[addScreenStyles.inputGroup, addScreenStyles.halfWidth]}>
                    <Text style={addScreenStyles.label}>Возраст (лет)</Text>
                    <TextInput
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#B6CAEB"
                      style={addScreenStyles.input}
                    />
                  </View>

                  <View style={[addScreenStyles.inputGroup, addScreenStyles.halfWidth]}>
                    <Text style={addScreenStyles.label}>Вес (кг)</Text>
                    <TextInput
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#B6CAEB"
                      style={addScreenStyles.input}
                    />
                  </View>
                </View>

                {/* Состояние здоровья */}
                <View style={addScreenStyles.inputGroup}>
                  <Text style={addScreenStyles.label}>Состояние здоровья</Text>
                  <TextInput
                    value={healthStatus}
                    onChangeText={setHealthStatus}
                    placeholder="Здоров, на лечении, аллергия и т.д."
                    placeholderTextColor="#B6CAEB"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={addScreenStyles.textArea}
                  />
                </View>
              </View>

              {/* Кнопки действий */}
              <View style={addScreenStyles.buttonContainer}>
                <TouchableOpacity
                  style={addScreenStyles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={addScreenStyles.cancelButtonText}>Отмена</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={addScreenStyles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={addScreenStyles.saveButtonText}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}