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

export default function CompleteProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!username.trim() || !phoneNumber.trim()) {
      Alert.alert('Ошибка', 'Имя и телефон обязательны');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      await api.post(
        '/pet-management/api/pet-owners/me',
        {
          username,
          phoneNumber,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.replace('/(tabs)'); 
    } catch (e: any) {
      console.log('❌ ERROR:', e?.response?.data);

      Alert.alert(
        'Ошибка',
        e?.response?.data?.message || 'Не удалось сохранить профиль'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Создайте профиль 🐾</Text>
      <TextInput
        placeholder="Имя пользователя"
        placeholderTextColor={colors.text.tertiary}
        value={username}
        onChangeText={setUsername}
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
        placeholder="Адрес"
        placeholderTextColor={colors.text.tertiary}
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={handleSave}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Сохранить</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};