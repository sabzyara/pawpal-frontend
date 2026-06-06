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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';

interface ServiceData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  serviceCategory?: string;
  experienceYears?: number;
  education?: string;
  address?: string;
  city?: string;
  pricePerVisit?: number;
  about?: string;
  avatarUrl?: string;
}

export default function CompleteServiceScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { fetchProfile } = useProfileStore();
  const user = useAuthStore((state) => state.user);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pricePerVisit, setPricePerVisit] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Имя и фамилия обязательны');
      return;
    }

    if (!serviceCategory) {
      Alert.alert('Ошибка', 'Категория услуг обязательна');
      return;
    }

    try {
      setLoading(true);

      const serviceData: ServiceData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      // Добавляем опциональные поля только если они заполнены
      if (phoneNumber.trim()) serviceData.phoneNumber = phoneNumber.trim();
      if (serviceCategory.trim()) serviceData.serviceCategory = serviceCategory.trim();
      if (experienceYears) serviceData.experienceYears = parseInt(experienceYears, 10);
      if (education.trim()) serviceData.education = education.trim();
      if (address.trim()) serviceData.address = address.trim();
      if (city.trim()) serviceData.city = city.trim();
      if (pricePerVisit) serviceData.pricePerVisit = parseFloat(pricePerVisit);
      if (about.trim()) serviceData.about = about.trim();
      if (avatarUrl.trim()) serviceData.avatarUrl = avatarUrl.trim();

      console.log('📤 Sending service data:', serviceData);

      const response = await api.post('/specialist-service/service-providers/me', serviceData);
      console.log('✅ API response status:', response.status);

      // Обновляем профиль в store
      if (user) {
        console.log('🔄 Fetching updated profile...');
        await fetchProfile(user);
        console.log('✅ Profile updated in store');
      }

      console.log('✅ Profile created successfully, showing alert');
      
      Alert.alert(
        'Успех!',
        'Профиль сервис-провайдера успешно создан',
        [
          {
            text: 'Перейти в профиль',
            onPress: () => {
              console.log('🔄 Redirecting to specialist profile...');
              router.replace('/specialist-profile');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.log('❌ Error status:', error?.response?.status);
      console.log('❌ Error data:', error?.response?.data);
      
      if (error?.response?.status === 409) {
        Alert.alert('Ошибка', 'Профиль уже существует');
      } else if (error?.response?.status === 403) {
        Alert.alert('Ошибка', 'У вас нет прав для создания профиля');
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
          {/* HEADER CARD */}
          <View
            style={{
              backgroundColor: colors.primary.main,
              borderRadius: 28,
              padding: 24,
              marginBottom: 24,
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 34, marginBottom: 8 }}>🛠️</Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text.inverse,
              }}
            >
              Сервис-профиль
            </Text>

            <Text
              style={{
                color: colors.text.inverse,
                opacity: 0.9,
                marginTop: 6,
              }}
            >
              Расскажите владельцам животных о своих услугах
            </Text>
          </View>

          {/* ОСНОВНАЯ ИНФОРМАЦИЯ */}
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

          {/* ПРОФЕССИОНАЛЬНАЯ ИНФОРМАЦИЯ */}
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
            <Ionicons name="briefcase-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Категория услуг * (груминг, дрессировка и т.д.)"
              placeholderTextColor={colors.text.tertiary}
              value={serviceCategory}
              onChangeText={setServiceCategory}
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
              style={styles.inputWithIcon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Адрес"
              placeholderTextColor={colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
              style={styles.inputWithIcon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Цена за визит (₸)"
              placeholderTextColor={colors.text.tertiary}
              value={pricePerVisit}
              onChangeText={setPricePerVisit}
              style={styles.inputWithIcon}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="image-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="URL фотографии"
              placeholderTextColor={colors.text.tertiary}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              style={styles.inputWithIcon}
              autoCapitalize="none"
            />
          </View>

          {/* ДОПОЛНИТЕЛЬНО */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: colors.text.primary,
              marginBottom: 12,
              marginTop: 20,
            }}
          >
            О себе
          </Text>

          <View style={styles.textAreaCard}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary.main} style={{ marginRight: 12 }} />
            <TextInput
              placeholder="Расскажите о себе, своем опыте и подходе к работе"
              placeholderTextColor={colors.text.tertiary}
              value={about}
              onChangeText={setAbout}
              style={styles.textAreaInput}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
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
  );
}