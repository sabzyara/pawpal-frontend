import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { Role, User as ProfileUser } from '@/types/profile';

export interface User extends ProfileUser {}

export interface RegisterData {
  email: string;
  password: string;
  role: Role;
}

interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

const getErrorMessage = (error: ApiError): string => {
  return error?.response?.data?.message || error?.message || 'Произошла ошибка';
};

const validateUserData = (userData: User): boolean => {
  if (!userData || userData.id == null) {
    throw new Error('Невалидные данные пользователя');
  }
  return true;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      initialize: async () => {
        if (get().isInitialized) {
          return;
        }

        const { token } = get();

        set({ isLoading: true, error: null });

        try {
          if (token) {
            await get().fetchCurrentUser();
          }
        } catch (error) {
          console.error('Initialization error:', error);
          set({
            token: null,
            user: null,
            error: error instanceof Error ? error.message : 'Ошибка инициализации',
          });
        } finally {
          set({
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      fetchCurrentUser: async () => {
        const { token } = get();

        if (!token) {
          throw new Error('Нет токена авторизации');
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.get('/user-service/auth/me');
          const userData: User = response.data;

          validateUserData(userData);

          set({
            user: userData,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = getErrorMessage(error);
          
          if (error?.response?.status === 401) {
            await get().logout();
            throw new Error('Сессия истекла');
          }

          set({
            error: errorMessage,
            isLoading: false,
          });

          throw error;
        }
      },

      login: async (email: string, password: string) => {
        if (get().isLoading) {
          return false;
        }

        set({
          isLoading: true,
          error: null,
        });

        try {
          const tokenResponse = await api.post('/user-service/auth/login', {
            email,
            password,
          });

          const token = tokenResponse.data;

          if (typeof token !== 'string' || !token.trim()) {
            throw new Error('Неверный формат токена');
          }

          set({ token });

          const userResponse = await api.get('/user-service/auth/me');
          const userData: User = userResponse.data;

          validateUserData(userData);

          set({
            user: userData,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          const errorMessage = getErrorMessage(error);
          
          set({
            error: errorMessage,
            token: null,
            user: null,
            isLoading: false,
          });

          return false;
        }
      },

      register: async (data: RegisterData) => {
        if (get().isLoading) {
          return false;
        }

        set({
          isLoading: true,
          error: null,
        });

        try {
          await api.post('/user-service/auth/register', data);
          
          set({ isLoading: false });
          
          const loginSuccess = await get().login(data.email, data.password);
          
          if (!loginSuccess) {
            throw new Error('Автоматический вход не удался');
          }
          
          return true;
        } catch (error: any) {
          const errorMessage = getErrorMessage(error);
          
          set({
            error: errorMessage,
            isLoading: false,
          });

          return false;
        }
      },

      updateUser: (data: Partial<User>) => {
        const { user } = get();

        if (!user) {
          console.warn('Попытка обновить пользователя, когда user === null');
          return;
        }

        set({
          user: {
            ...user,
            ...data,
          },
        });
      },

      logout: async () => {
        set({
          user: null,
          token: null,
          error: null,
          isLoading: false,
          isInitialized: false,
        });
       
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            token: persistedState.token,
            user: persistedState.user,
          };
        }
        return persistedState;
      },
    }
  )
);