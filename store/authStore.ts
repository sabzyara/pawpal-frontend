import { create } from 'zustand';
import { RegisterData, LoginData, AuthResponse } from '@/types/auth';
import { router } from 'expo-router';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStore {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  loadUser: () => Promise<void>; // 👈 ДОБАВИЛИ
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // 🔥 ЗАГРУЗКА TOKEN ПРИ СТАРТЕ
  loadUser: async () => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      set({ token });
    }
  },

  // 🔐 LOGIN
  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/user-service/auth/login", data);

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data; 

  await AsyncStorage.setItem("token", token);

  set({
  user: null, // пока нет user
  token: token,
  isLoading: false,
});

      return true;
    } catch (error: any) {
      console.log("LOGIN ERROR:", error?.response?.data);

      set({
        error:
          error.response?.data?.message ||
          "Ошибка входа",
        isLoading: false,
      });

      return false;
    }
  },

register: async (data: RegisterData) => {
  set({ isLoading: true, error: null });

  try {
    await api.post("/user-service/auth/register", data);

    // 🔥 сразу логинимся
    const loginRes = await api.post("/user-service/auth/login", {
      email: data.email,
      password: data.password,
    });

    const token = loginRes.data;

    await AsyncStorage.setItem("token", token);

    set({
      token,
      user: null,
      isLoading: false,
    });

    return true;
  } catch (error: any) {
    set({
      error:
        error.response?.data?.message ||
        "Ошибка регистрации",
      isLoading: false,
    });

    return false;
  }
},
  logout: async () => {
    await AsyncStorage.removeItem("token"); // 👈 очистка
    set({ user: null, token: null });
    router.replace('/(tabs)/login');
  },

  clearError: () => set({ error: null }),
}));