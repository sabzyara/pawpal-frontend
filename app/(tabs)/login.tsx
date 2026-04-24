import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore'; // 🔥 ДОБАВИЛИ
import { styles } from '@/styles/loginStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();
  const { fetchProfile } = useProfileStore(); // 🔥 ДОБАВИЛИ

  type RoleRoute = {
    endpoint: string;
    complete:
      | "/(tabs)/complete_profile"
      | "/(tabs)/complete_vet"
      | "/(tabs)/complete_service";
  };

  const getRouteByRole = (role: string): RoleRoute | null => {
    switch (role) {
      case 'OWNER':
        return {
          endpoint: '/pet-management/api/pet-owners/me',
          complete: '/(tabs)/complete_profile',
        };
      case 'VET':
        return {
          endpoint: '/specialist-service/api/veterinarians/me',
          complete: '/(tabs)/complete_vet',
        };
      case 'SERVICE':
        return {
          endpoint: '/specialist-service/api/service-providers/me',
          complete: '/(tabs)/complete_service',
        };
      default:
        return null;
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const success = await login({ email, password });

    if (success) {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert("Ошибка", "Нет токена");
          return;
        }

        // 🔥 получаем пользователя
        const me = await api.get('/user-service/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const role = me.data.role?.name || me.data.role;
        const config = getRouteByRole(role);

        if (!config) {
          Alert.alert("Ошибка", "Неизвестная роль");
          return;
        }

        try {
          // 🔥 проверяем профиль
          await api.get(config.endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // ✅ ПРОФИЛЬ ЕСТЬ → СРАЗУ ГРУЗИМ
          await fetchProfile(); // 🔥 ГЛАВНЫЙ ФИКС

          router.replace('/(tabs)');

        } catch (e: any) {
          if (e.response?.status === 404) {
            router.replace(config.complete);
          } else if (e.response?.status === 401) {
            Alert.alert("Ошибка", "Сессия истекла");
            router.replace('/(tabs)/login');
          } else {
            console.log(e);
            Alert.alert('Ошибка', 'Ошибка проверки профиля');
          }
        }

      } catch (e) {
        console.log(e);
        Alert.alert('Ошибка', 'Не удалось получить данные пользователя');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>

          <LinearGradient
            colors={['#7A2E4D', '#E06387']}
            style={styles.header}
          >
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>PawPal</Text>
            <Text style={styles.subtitle}>
              Ваш помощник в уходе за питомцами
            </Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.card}>
            <View style={styles.form}>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  clearError();
                  setEmail(text);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Пароль"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    clearError();
                    setPassword(text);
                  }}
                />

                <TouchableOpacity
                  style={styles.eye}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Войти</Text>
                )}
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Нет аккаунта? </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/register')}>
                  <Text style={styles.registerLink}>Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}