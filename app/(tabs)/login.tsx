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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { loginStyles } from '@/styles/loginStyles';

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
      router.replace('/(tabs)');
    }
  };

  const handleRegister = () => {
    router.push('/(tabs)/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={loginStyles.container}
    >
      <ScrollView contentContainerStyle={loginStyles.scrollContent}>
        <View style={loginStyles.header}>
          <Text style={loginStyles.logo}>🐾</Text>
          <Text style={loginStyles.title}>PawPal</Text>
          <Text style={loginStyles.subtitle}>Ваш помощник в уходе за питомцами</Text>
        </View>

        <View style={loginStyles.form}>
          {error && (
            <View style={loginStyles.errorContainer}>
              <Text style={loginStyles.errorText}>{error}</Text>
            </View>
          )}

          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.label}>Email</Text>
            <TextInput
              style={loginStyles.input}
              placeholder="example@mail.com"
              placeholderTextColor="#B6CAEB"
              value={email}
              onChangeText={(text) => {
                clearError();
                setEmail(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.label}>Пароль</Text>
            <View style={loginStyles.passwordContainer}>
              <TextInput
                style={[loginStyles.input, loginStyles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor="#B6CAEB"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  clearError();
                  setPassword(text);
                }}
              />
              <TouchableOpacity
                style={loginStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={loginStyles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={loginStyles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>

          <View style={loginStyles.registerContainer}>
            <Text style={loginStyles.registerText}>Нет аккаунта? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={loginStyles.registerLink}>Зарегистрироваться</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}