import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { createStyles } from '@/styles/completePagesStyles';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';

interface OwnerData {
  username: string;
  phoneNumber: string;
  address?: string | null;
}

export default function CompleteProfileScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { fetchProfile } = useProfileStore();
  const user = useAuthStore((state) => state.user);

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!username.trim()) {
      Alert.alert('Ошибка', 'Имя пользователя обязательно');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Ошибка', 'Номер телефона обязателен');
      return;
    }

    // Валидация номера телефона (минимальная)
    const phoneRegex = /^[\+\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      Alert.alert('Ошибка', 'Введите корректный номер телефона');
      return;
    }

    try {
      setLoading(true);

      const ownerData: OwnerData = {
        username: username.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      if (address.trim()) {
        ownerData.address = address.trim();
      }

      console.log('📤 Sending owner data:', ownerData);

      const response = await api.post('/pet-management/api/pet-owners/me', ownerData);
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
        'Профиль владельца питомца успешно создан',
        [
          {
            text: 'Перейти в приложение',
            onPress: () => {
              console.log('🔄 Redirecting to owner main...');
              router.replace('/(owner)');
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
            <Text style={{ fontSize: 34, marginBottom: 8 }}>🐾</Text>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text.inverse,
              }}
            >
              Создайте профиль
            </Text>

            <Text
              style={{
                color: colors.text.inverse,
                opacity: 0.9,
                marginTop: 6,
              }}
            >
              Расскажите о себе владельцам животных
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
            Личная информация
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Имя пользователя *"
              placeholderTextColor={colors.text.tertiary}
              value={username}
              onChangeText={setUsername}
              style={styles.inputWithIcon}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color={colors.primary.main} style={styles.inputIcon} />
            <TextInput
              placeholder="Телефон *"
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
              placeholder="Адрес"
              placeholderTextColor={colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
              style={styles.inputWithIcon}
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
              <Text style={styles.buttonText}>Сохранить профиль</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}