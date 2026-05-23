import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { createStyles } from '@/styles/loginStyles';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  type RoleRoute = {
    endpoint: string;
    complete:
      | "/complete_profile"
      | "/complete_vet"
      | "/complete_service";
  };

  const getRouteByRole = (role: string): RoleRoute | null => {
    switch (role) {
      case 'OWNER':
        return {
          endpoint: '/pet-management/api/pet-owners/me',
          complete: '/complete_profile',
        };
      case 'VET':
        return {
          endpoint: '/specialist-service/api/veterinarians/me',
          complete: '/complete_vet',
        };
      case 'SERVICE':
        return {
          endpoint: '/specialist-service/api/service-providers/me',
          complete: '/complete_service',
        };
      default:
        return null;
    }
  };

// const getMainRouteByRole = (role: string) => {
//   switch (role) {
//     case 'OWNER':
//       // return '/(owner)';
//       return '/index';

//     case 'ADMIN':
//       // return '/(admin)';
//       return '/admin-main';

//     case 'VET':
//       // return '/(specialist)';
//       return 'vets-list';

//     case 'SERVICE':
//       // return '/(specialist)';
//       return '/vets-list';

//     default:
//       return '/(auth)/login';
//   }
// };

  const getMainRouteByRole = (role: string) => {
    switch (role) {
      case "OWNER":
        return "/";

      case "ADMIN":
        return "/admin-main";

      case "VET":
        return "/vet-profile";

      case "SERVICE":
        return "/vet-profile";

      default:
        return "/login";
    }
  };

  const handleLogin = async () => { 
    console.log("REQUEST START");

    // await AsyncStorage.removeItem("token");
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    const success = await login({ email, password });

    const savedToken = await AsyncStorage.getItem("token");
    console.log("SAVED TOKEN:", savedToken);

    if (success) {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert("Ошибка", "Нет токена");
          return;
        }

        const me = await api.get('/user-service/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        useAuthStore.setState({
          user: me.data,
        });


        const role = me.data.role?.name || me.data.role;

        if (role === "ADMIN") {
          router.replace('/(admin)/admin-main');
          return;
        }

        const config = getRouteByRole(role);

        if (!config) {
          Alert.alert("Ошибка", "Неизвестная роль");
          return;
        }

        try {
          await api.get(config.endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          await fetchProfile(); 

          // router.replace('/(tabs)');
          router.replace(getMainRouteByRole(role) as any);

      

        } catch (e: any) {
          if (e.response?.status === 404) {
            router.replace(config.complete);
          } else if (e.response?.status === 401) {
            Alert.alert("Ошибка", "Сессия истекла");
            router.replace('/login');
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
    <SafeAreaView style={{ flex: 1 , backgroundColor: colors.background.primary}} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>


          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center', 
            }}
            keyboardShouldPersistTaps="handled"
          >
              <LinearGradient
                colors={colors.primary.gradient}
                style={[styles.header, { width: '100%' }]}
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
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                  />

                  <TouchableOpacity
                    style={styles.eye}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.text.secondary}
                    />
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
                  <TouchableOpacity onPress={() => router.push('/register')}>
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