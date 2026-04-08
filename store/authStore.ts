import { create } from 'zustand';
import { RegisterData, LoginData, AuthResponse } from '@/types/auth';
import { router } from 'expo-router';
import api from '@/services/api';

interface AuthStore {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // 🔐 LOGIN (РЕАЛЬНЫЙ)
  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/user-service/auth/login", data);

      console.log("LOGIN RESPONSE:", response.data);

      set({
        user: response.data.user,
        token: response.data.token,
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

  // 📝 REGISTER (пока можно оставить мок или тоже подключить API)
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/user-service/auth/register", data);

      set({
        user: response.data.user,
        token: response.data.token,
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

  logout: () => {
    set({ user: null, token: null });
    router.replace('/(tabs)/login');
  },

  clearError: () => set({ error: null }),
}));