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

export default function CompleteVetScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

      const vetData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || null,
        licenseNumber: licenseNumber.trim(),
        clinicName: clinicName.trim(),
        experienceYears: experienceYears ? parseInt(experienceYears) : null,
        avatarUrl: avatarUrl.trim() || null,
        about: about.trim() || null,
        education: education.trim() || null,
        pricePerVisit: pricePerVisit ? parseFloat(pricePerVisit) : null,
        address: address.trim() || null,
        city: city.trim() || null
      };

      console.log('Sending vet data:', vetData);

      // ✅ Исправлено: убраны лишние headers (интерцептор добавит токен)
      await api.post('/specialist-service/veterinarians/me', vetData);

      Alert.alert('Успех', 'Профиль ветеринара успешно создан', [
        { text: 'OK', onPress: () => router.replace('/specialist-profile') }
      ]);
      
    } catch (e: any) {
      console.log('Error response:', e?.response?.data);
      
      if (e?.response?.status === 409) {
        Alert.alert('Ошибка', 'Профиль ветеринара уже существует');
      } else if (e?.response?.status === 403) {
        Alert.alert('Ошибка', 'У вас нет прав для создания профиля ветеринара');
      } else if (e?.response?.status === 401) {
        Alert.alert('Ошибка', 'Сессия истекла. Пожалуйста, войдите заново');
        router.replace('/login');
      } else if (e?.response?.data?.message) {
        Alert.alert('Ошибка', e.response.data.message);
      } else {
        Alert.alert('Ошибка', 'Не удалось сохранить профиль. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={{ flex: 1, backgroundColor: colors.background.primary }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Профиль ветеринара 🐾</Text>
          <Text style={styles.subtitle}>
            Заполните информацию о себе
          </Text>

          <TextInput
            placeholder="Имя *"
            placeholderTextColor={colors.text.tertiary}
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />

          <TextInput
            placeholder="Фамилия *"
            placeholderTextColor={colors.text.tertiary}
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />

          <TextInput
            placeholder="Номер лицензии *"
            placeholderTextColor={colors.text.tertiary}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            style={styles.input}
          />

          <TextInput
            placeholder="Название клиники *"
            placeholderTextColor={colors.text.tertiary}
            value={clinicName}
            onChangeText={setClinicName}
            style={styles.input}
          />

          <TextInput
            placeholder="Телефон"
            placeholderTextColor={colors.text.tertiary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            placeholder="Город"
            placeholderTextColor={colors.text.tertiary}
            value={city}
            onChangeText={setCity}
            style={styles.input}
          />

          <TextInput
            placeholder="Адрес"
            placeholderTextColor={colors.text.tertiary}
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <TextInput
            placeholder="Опыт работы (лет)"
            placeholderTextColor={colors.text.tertiary}
            value={experienceYears}
            onChangeText={setExperienceYears}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            placeholder="Образование"
            placeholderTextColor={colors.text.tertiary}
            value={education}
            onChangeText={setEducation}
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            placeholder="О себе"
            placeholderTextColor={colors.text.tertiary}
            value={about}
            onChangeText={setAbout}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
          />

          <TextInput
            placeholder="Цена за прием (₸)"
            placeholderTextColor={colors.text.tertiary}
            value={pricePerVisit}
            onChangeText={setPricePerVisit}
            style={styles.input}
            keyboardType="numeric"
          />

          <TextInput
            placeholder="URL аватара"
            placeholderTextColor={colors.text.tertiary}
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            style={styles.input}
            autoCapitalize="none"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
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