import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { createStyles } from '@/styles/completePagesStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Имя и фамилия обязательны');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      await api.post(
        '/specialist-service/api/veterinarians/me',
        {
          firstName,
          lastName,
          phoneNumber,
          licenseNumber,
          clinicName,
          experienceYears: Number(experienceYears),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.replace('/(owner)');
    } catch (e: any) {
      console.log(e?.response?.data);
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль ветеринара 🐾</Text>

      <TextInput
        placeholder="Имя"
        placeholderTextColor={colors.text.tertiary}
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />

      <TextInput
        placeholder="Фамилия"
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
      />

      <TextInput
        placeholder="Лицензия"
        placeholderTextColor={colors.text.tertiary}
        value={licenseNumber}
        onChangeText={setLicenseNumber}
        style={styles.input}
      />

      <TextInput
        placeholder="Клиника"
        placeholderTextColor={colors.text.tertiary}
        value={clinicName}
        onChangeText={setClinicName}
        style={styles.input}
      />

      <TextInput
        placeholder="Опыт (лет)"
        placeholderTextColor={colors.text.tertiary}
        value={experienceYears}
        onChangeText={setExperienceYears}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {loading ? (
          <ActivityIndicator color={colors.text.inverse} />
        ) : (
          <Text style={styles.buttonText}>Сохранить</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}