import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { createStyles } from '@/styles/completePagesStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function CompleteServiceScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Имя и фамилия обязательны');
      return;
    }

    try {
      setLoading(true);

      // ✅ Исправлен эндпоинт (убрал /api)
      await api.post(
        '/specialist-service/service-providers/me',
        {
          firstName,
          lastName,
          phoneNumber: phoneNumber || null,
          serviceCategory: serviceCategory || null,
          experienceYears: experienceYears ? parseInt(experienceYears) : null,
          education: education || null,
          address: address || null,
          city: city || null,
          pricePerVisit: pricePerVisit ? parseFloat(pricePerVisit) : null,
          about: about || null,
        }
      );

      Alert.alert('Успех', 'Профиль успешно создан', [
        { text: 'OK', onPress: () => router.replace('/specialist-profile') }
      ]);
    } catch (e: any) {
      console.log(e?.response?.data);
      Alert.alert('Ошибка', e?.response?.data?.message || 'Не удалось сохранить профиль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Сервис-профиль 🛠</Text>

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
        placeholder="Телефон" 
        placeholderTextColor={colors.text.tertiary} 
        value={phoneNumber} 
        onChangeText={setPhoneNumber} 
        style={styles.input} 
        keyboardType="phone-pad"
      />
      
      <TextInput
        placeholder="Категория услуг (груминг, дрессировка и т.д.)"
        placeholderTextColor={colors.text.tertiary}
        value={serviceCategory}
        onChangeText={setServiceCategory}
        style={styles.input}
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
      />

      <TextInput
        placeholder="Адрес"
        placeholderTextColor={colors.text.tertiary}
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <TextInput
        placeholder="Город"
        placeholderTextColor={colors.text.tertiary}
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <TextInput
        placeholder="Цена за визит"
        placeholderTextColor={colors.text.tertiary}
        value={pricePerVisit}
        onChangeText={setPricePerVisit}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="О себе"
        placeholderTextColor={colors.text.tertiary}
        value={about}
        onChangeText={setAbout}
        style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Сохранить</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}