// app/(auth)/login.tsx - исправленная версия
import { useTheme } from '@/hooks/useTheme';
import { useLoginWithRedirect } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore'; 
import { createStyles } from '@/styles/loginStyles';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../i18n";
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const login = useLoginWithRedirect(); 
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { t } = useTranslation();
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('login.Error'), t('login.Please fill in all fields'));
      return;
    }

    const success = await login(email, password);

    if (!success && error) {
      Alert.alert(t('login.Error'), error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={colors.primary.gradient} style={[styles.header, { width: '100%' }]}>
            <View style={styles.logoWrapper}>
              <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.title}>PawPal</Text>
            <Text style={styles.subtitle}>Ваш помощник в уходе за питомцами</Text>
          </LinearGradient>

          <View style={[styles.form, { marginTop: 20 }]}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.text.tertiary}
              value={email}
              onChangeText={(text) => { 
                clearError(); 
                setEmail(text); 
              }}
              onFocus={() => clearError()}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                placeholderTextColor={colors.text.tertiary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => { 
                  clearError(); 
                  setPassword(text); 
                }}
                onFocus={() => clearError()}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button]} 
              onPress={handleLogin} 
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Войти</Text>}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Нет аккаунта? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}>Зарегистрироваться</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}