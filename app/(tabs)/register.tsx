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
import { Role } from '@/types/auth';
import { registerStyles } from '@/styles/registerStyles';

export default function RegisterScreen() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.OWNER);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, isLoading, error, clearError } = useAuthStore();

  const roles = [
    { id: Role.OWNER, name: 'Владелец питомца', icon: '🐾' },
    { id: Role.VET, name: 'Ветеринар', icon: '👨‍⚕️' },
    { id: Role.SERVICE, name: 'Сервис-провайдер', icon: '🛠️' },
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }

    const success = await register({
        email,
        password,
        role: selectedRole,
      });

    if (success) {
      router.replace('/(tabs)/login'); // следующий шаг
    }
  };

  // 🔹 Шаг 1 — выбор роли
  if (step === 'role') {
    return (
      <ScrollView style={registerStyles.container}>
        <View style={registerStyles.header}>
          <Text style={registerStyles.title}>Выберите роль</Text>
          <Text style={registerStyles.subtitle}>Кем вы будете?</Text>
        </View>

        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={registerStyles.roleCard}
            onPress={() => handleRoleSelect(role.id)}
          >
            <Text style={registerStyles.roleIcon}>{role.icon}</Text>
            <Text style={registerStyles.roleName}>{role.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // 🔹 Шаг 2 — email + password
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={registerStyles.container}
    >
      <ScrollView contentContainerStyle={registerStyles.scrollContent}>
        <View style={registerStyles.header}>
          <TouchableOpacity onPress={() => setStep('role')}>
            <Text>← Назад</Text>
          </TouchableOpacity>

          <Text style={registerStyles.title}>
            Регистрация
          </Text>
        </View>

        <View style={registerStyles.form}>
          {error && (
            <View style={registerStyles.errorContainer}>
              <Text style={registerStyles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>Email</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="example@mail.com"
              value={email}
              onChangeText={(text) => {
                clearError();
                setEmail(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>Пароль</Text>

            <View style={registerStyles.passwordContainer}>
              <TextInput
                style={[registerStyles.input, registerStyles.passwordInput]}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={registerStyles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={registerStyles.registerButtonText}>
                Зарегистрироваться
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={registerStyles.loginLink}
            onPress={() => router.push('/(tabs)/login')}
          >
            <Text style={registerStyles.loginLinkText}>
              Уже есть аккаунт? Войти
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}