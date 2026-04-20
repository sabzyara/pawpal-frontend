import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CompleteVetScreen() {
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

      router.replace('/(tabs)');
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

      <TextInput placeholder="Имя" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Фамилия" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput placeholder="Телефон" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} />
      <TextInput placeholder="Лицензия" value={licenseNumber} onChangeText={setLicenseNumber} style={styles.input} />
      <TextInput placeholder="Клиника" value={clinicName} onChangeText={setClinicName} style={styles.input} />
      <TextInput
        placeholder="Опыт (лет)"
        value={experienceYears}
        onChangeText={setExperienceYears}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Сохранить</Text>}
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#7A2E4D',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7A2E4D',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});