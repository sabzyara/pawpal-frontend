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

export default function CompleteServiceScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
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
        '/specialist-service/api/service-providers/me',
        {
          firstName,
          lastName,
          phoneNumber,
          serviceCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.replace('/(owner)'); // следующий шаг
    } catch (e: any) {
      console.log(e?.response?.data);
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Сервис-профиль 🛠</Text>

      <TextInput placeholder="Имя" placeholderTextColor={colors.text.tertiary} value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Фамилия" placeholderTextColor={colors.text.tertiary} value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput placeholder="Телефон" placeholderTextColor={colors.text.tertiary} value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} />
      <TextInput
        placeholder="Категория услуг (груминг и т.д.)"
        value={serviceCategory}
        onChangeText={setServiceCategory}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Сохранить</Text>}
      </TouchableOpacity>
    </View>
  );
};