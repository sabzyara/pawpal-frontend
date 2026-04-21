import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { UserProfile } from '@/types/profile';

interface ProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  // 🔥 ГЛАВНЫЙ МЕТОД
  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        throw new Error('No token');
      }

      // 1️⃣ получаем USER
      const userRes = await api.get('/user-service/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = userRes.data;

      let petOwner = null;
      let veterinarian = null;
      let serviceProvider = null;

      // 2️⃣ по роли тянем профиль
      if (user.role === 'OWNER') {
        try {
          const res = await api.get('/pet-management/api/pet-owners/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          petOwner = res.data;
        } catch (e) {
          console.log('OWNER profile not found');
        }
      }

      if (user.role === 'VET') {
        try {
          const res = await api.get('/specialist-service/api/veterinarians/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          veterinarian = res.data;
        } catch (e) {
          console.log('VET profile not found');
        }
      }

      if (user.role === 'SERVICE') {
        try {
          const res = await api.get('/specialist-service/api/service-providers/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          serviceProvider = res.data;
        } catch (e) {
          console.log('SERVICE profile not found');
        }
      }

      // 3️⃣ собираем профиль
      const fullProfile: UserProfile = {
        user,
        petOwner,
        veterinarian,
        serviceProvider,
      };

      set({
        profile: fullProfile,
        loading: false,
      });

    } catch (e: any) {
      console.log('❌ PROFILE ERROR:', e?.response?.data || e.message);

      set({
        error: 'Не удалось загрузить профиль',
        loading: false,
      });
    }
  },

  // ✏️ обновление профиля (пока простое)
  updateProfile: async (data) => {
    try {
      set({ loading: true });

      const current = get().profile;

      if (!current) return;

      set({
        profile: {
          ...current,
          ...data,
        },
        loading: false,
      });

    } catch {
      set({
        error: 'Ошибка обновления',
        loading: false,
      });
    }
  },

  // 🚪 logout
  logout: async () => {
    await AsyncStorage.removeItem('token');

    set({
      profile: null,
      error: null,
    });
  },
}));