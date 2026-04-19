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
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { styles } from '@/styles/loginStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();
const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
    return;
  }

  const success = await login({ email, password });

  if (success) {
  try {
    const token = await AsyncStorage.getItem("token");

    await api.get('/pet-management/api/pet-owners/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ профиль есть
    router.replace('/(tabs)');
    
  } catch (e: any) {
    if (e.response?.status === 404) {
      // ❗ профиля нет
      router.replace('/(tabs)/complete_profile');
    } else if (e.response?.status === 401) {
      Alert.alert('Ошибка', 'Проблема с авторизацией');
    } else {
      console.log(e);
      Alert.alert('Ошибка', 'Не удалось проверить профиль');
    }
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

        {/* 🔮 HEADER */}
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

        {/* 🧾 CARD */}
        <ScrollView contentContainerStyle={styles.card}>
          <View style={styles.form}>

            {/* ERROR */}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* EMAIL */}
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

            {/* PASSWORD */}
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

            {/* BUTTON */}
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

            {/* REGISTER */}
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
