import { create } from 'zustand';
import { RegisterData, LoginData, AuthResponse, Role } from '@/types/auth';
import { router } from 'expo-router';

interface AuthStore {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Mock API - замените на реальные запросы к вашему бекенду
const mockRegister = async (data: RegisterData): Promise<AuthResponse> => {
  // Имитация API запроса
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // В реальном приложении здесь будет POST запрос к вашему API
  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: Date.now(),
      email: data.email,
      role: data.role,
      status: "ACTIVE"
    }
  };
};

const mockLogin = async (data: LoginData): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Простая валидация для демо
  if (!data.email || !data.password) {
    throw new Error("Введите email и пароль");
  }
  
  // Определяем роль по email для демо (в реальности бекенд возвращает)
  let role: Role = Role.OWNER;
  if (data.email.includes('vet@')) role = Role.VET;
  else if (data.email.includes('service@')) role = Role.SERVICE;
  else if (data.email.includes('admin@')) role = Role.ADMIN;
  
  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: Date.now(),
      email: data.email,
      role: role,
      status: "ACTIVE"
    }
  };
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mockRegister(data);
      set({ 
        user: response.user, 
        token: response.token,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ error: error.message || "Ошибка регистрации", isLoading: false });
      return false;
    }
  },
  
  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mockLogin(data);
      set({ 
        user: response.user, 
        token: response.token,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ error: error.message || "Ошибка входа", isLoading: false });
      return false;
    }
  },
  
  logout: () => {
    set({ user: null, token: null });
    router.replace('/(auth)/login');
  },
  
  clearError: () => set({ error: null }),
}));