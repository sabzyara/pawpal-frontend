// app/(auth)/register.tsx
import { useTheme } from '@/hooks/useTheme';
import { useRegisterWithRedirect } from '@/hooks/useAuth'; 
import { createStyles } from '@/styles/registerStyles';
import { Role } from '@/types/profile';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";


type CompleteProfileRoute = '/complete_profile' | '/complete_vet' | '/complete_service';

const getCompleteProfileRoute = (role: Role): CompleteProfileRoute => {
  switch (role) {
    case Role.OWNER: return '/complete_profile';
    case Role.VET: return '/complete_vet';
    case Role.SERVICE: return '/complete_service';
    default: return '/complete_profile';
  }
};

export default function RegisterScreen() {
  const { colors } = useTheme();
  const registerStyles = createStyles(colors);
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.OWNER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  
  const { register, isLoading, error, clearError } = useRegisterWithRedirect();

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


    const success = await register({ email, password, role: selectedRole });
    
    if (!success && error) {
      Alert.alert('Ошибка', error);
    }
  };


  if (step === 'role') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
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
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={registerStyles.container}>
        <ScrollView contentContainerStyle={[registerStyles.scrollContent, { paddingTop: 30 }]}>
          <View style={registerStyles.header}>
            <TouchableOpacity 
              onPress={() => setStep('role')} 
              style={{ marginBottom: 12, paddingVertical: 4 }}
            >
              <Feather name="arrow-left" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            <Text style={registerStyles.title}>Регистрация</Text>
            
            {/* Отображение выбранной роли */}
            <View style={registerStyles.selectedRoleBadge}>
              <Text style={registerStyles.selectedRoleIcon}>
                {roles.find(r => r.id === selectedRole)?.icon}
              </Text>
              <Text style={registerStyles.selectedRoleText}>
                {roles.find(r => r.id === selectedRole)?.name}
              </Text>
            </View>
          </View>

          <View style={registerStyles.form}>
            {error && (
              <View style={registerStyles.errorContainer}>
                <Text style={registerStyles.errorText}>{error}</Text>
              </View>
            )}

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Email</Text>
              <TextInput
                style={registerStyles.input}
                placeholder="example@mail.com"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={(text) => { clearError(); setEmail(text); }}
                onFocus={() => clearError()}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={registerStyles.inputGroup}>
              <Text style={registerStyles.label}>Пароль</Text>
              <View style={registerStyles.passwordContainer}>
                <TextInput
                  style={[registerStyles.input, registerStyles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => { clearError(); setPassword(text); }}
                  onFocus={() => clearError()}
                  onSubmitEditing={handleRegister}
                  returnKeyType="done"
                />
                <TouchableOpacity style={registerStyles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[registerStyles.registerButton, isLoading && registerStyles.buttonDisabled]} 
              onPress={handleRegister} 
              disabled={isLoading}
            >
              {isLoading ? 
                <ActivityIndicator color="#fff" /> : 
                <Text style={registerStyles.registerButtonText}>Зарегистрироваться</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={registerStyles.loginLink} onPress={() => router.push('/login')}>
              <Text style={registerStyles.loginLinkText}>Уже есть аккаунт? Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}