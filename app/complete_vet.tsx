import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { createStyles } from '@/styles/completePagesStyles';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';

interface VetData {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  clinicName: string;
  phoneNumber?: string;
  city?: string;
  experienceYears?: number;
  education?: string;
  address?: string;
  about?: string;
  pricePerVisit?: number;
  avatarUrl?: string;
}

export default function CompleteVetScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { fetchProfile } = useProfileStore();
  const user = useAuthStore((state) => state.user);

  // Состояния формы
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [about, setAbout] = useState('');
  const [education, setEducation] = useState('');
  const [pricePerVisit, setPricePerVisit] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Имя и фамилия обязательны');
      return;
    }

    if (!licenseNumber) {
      Alert.alert('Ошибка', 'Номер лицензии обязателен');
      return;
    }

    if (!clinicName) {
      Alert.alert('Ошибка', 'Название клиники обязательно');
      return;
    }

    try {
      setLoading(true);

      // Формируем данные для отправки
      const vetData: VetData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        licenseNumber: licenseNumber.trim(),
        clinicName: clinicName.trim(),
      };

      // Добавляем опциональные поля только если они заполнены
      if (phoneNumber.trim()) vetData.phoneNumber = phoneNumber.trim();
      if (city.trim()) vetData.city = city.trim();
      if (experienceYears) vetData.experienceYears = parseInt(experienceYears, 10);
      if (education.trim()) vetData.education = education.trim();
      if (address.trim()) vetData.address = address.trim();
      if (about.trim()) vetData.about = about.trim();
      if (pricePerVisit) vetData.pricePerVisit = parseFloat(pricePerVisit);
      if (avatarUrl.trim()) vetData.avatarUrl = avatarUrl.trim();

      console.log('📤 Sending vet data:', vetData);

      // Отправляем запрос на создание профиля
      const response = await api.post('/specialist-service/veterinarians/me', vetData);
      console.log('✅ API response status:', response.status);

      // Обновляем профиль в store
      if (user) {
        console.log('🔄 Fetching updated profile...');
        await fetchProfile(user);
        console.log('✅ Profile updated in store');
      }

      // Успех - показываем Alert и редиректим
      console.log('✅ Profile created successfully, showing alert');
      
      Alert.alert(
        'Успех!', 
        'Профиль ветеринара успешно создан', 
        [
          { 
            text: 'Перейти в профиль', 
            onPress: () => {
              console.log('🔄 Redirecting to specialist profile...');
              router.replace('/(specialist)/profile');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.log('❌ Error status:', error?.response?.status);
      console.log('❌ Error data:', error?.response?.data);
      
      // Обработка различных ошибок
      if (error?.response?.status === 409) {
        Alert.alert('Ошибка', 'Профиль ветеринара уже существует');
      } else if (error?.response?.status === 403) {
        Alert.alert('Ошибка', 'У вас нет прав для создания профиля ветеринара');
      } else if (error?.response?.status === 401) {
        Alert.alert('Ошибка', 'Сессия истекла. Пожалуйста, войдите заново');
        router.replace('/(auth)/login');
      } else if (error?.response?.status === 400) {
        Alert.alert('Ошибка', 'Проверьте правильность заполнения полей');
      } else if (error?.response?.data?.message) {
        Alert.alert('Ошибка', error.response.data.message);
      } else if (error?.message === 'Network Error') {
        Alert.alert('Ошибка', 'Нет соединения с сервером');
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить профиль. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.container}>
          {/* Header Card */}
          <View
            style={{
              backgroundColor: colors.primary.main,
              borderRadius: 28,
              padding: 24,
              marginBottom: 24,
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 34, marginBottom: 8 }}>🐾</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text.inverse,
              }}
            >
              Профиль ветеринара
            </Text>
            <Text
              style={{
                color: colors.text.inverse,
                opacity: 0.9,
                marginTop: 6,
              }}
            >
              Расскажите владельцам животных о себе
            </Text>
          </View>

          {/* Основная информация */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 12,
              marginTop: 8,
            }}
          >
            Основная информация
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Имя *"
              placeholderTextColor={colors.text.tertiary}
              value={firstName}
              onChangeText={setFirstName}
              style={styles.inputWithIcon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Фамилия *"
              placeholderTextColor={colors.text.tertiary}
              value={lastName}
              onChangeText={setLastName}
              style={styles.inputWithIcon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Телефон"
              placeholderTextColor={colors.text.tertiary}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.inputWithIcon}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Город"
              placeholderTextColor={colors.text.tertiary}
              value={city}
              onChangeText={setCity}
              style={styles.inputWithIcon}
            />
          </View>

          {/* Профессиональная информация */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 12,
              marginTop: 20,
            }}
          >
            Профессиональная информация
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Номер лицензии *"
              placeholderTextColor={colors.text.tertiary}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              style={styles.inputWithIcon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Название клиники *"
              placeholderTextColor={colors.text.tertiary}
              value={clinicName}
              onChangeText={setClinicName}
              style={styles.inputWithIcon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="time-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Опыт работы (лет)"
              placeholderTextColor={colors.text.tertiary}
              value={experienceYears}
              onChangeText={setExperienceYears}
              style={styles.inputWithIcon}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="school-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Образование"
              placeholderTextColor={colors.text.tertiary}
              value={education}
              onChangeText={setEducation}
              style={[styles.inputWithIcon, styles.textAreaMultiline]}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Адрес клиники"
              placeholderTextColor={colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
              style={[styles.inputWithIcon, styles.textAreaMultiline]}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* О себе и работе */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 12,
              marginTop: 20,
            }}
          >
            О себе и работе
          </Text>

          <View style={styles.textAreaCard}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary.main} style={{ marginRight: 12 }} />
            <TextInput
              placeholder="Расскажите о себе, своем опыте и подходе к лечению"
              placeholderTextColor={colors.text.tertiary}
              value={about}
              onChangeText={setAbout}
              style={styles.textAreaInput}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Цена за прием (₸)"
              placeholderTextColor={colors.text.tertiary}
              value={pricePerVisit}
              onChangeText={setPricePerVisit}
              style={styles.inputWithIcon}
              keyboardType="numeric"
            />
          </View>

          {/* Кнопка сохранения */}
          <TouchableOpacity 
            style={[
              styles.button, 
              loading && { opacity: 0.6 },
              { 
                height: 58,
                borderRadius: 20,
                marginTop: 28,
                marginBottom: 40,
              }
            ]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.buttonText}>Создать профиль</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}