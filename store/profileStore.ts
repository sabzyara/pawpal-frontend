import { create } from 'zustand';
import { UserProfile, Role, UserStatus } from '@/types/profile';

interface ProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
}

// Mock данные для разных ролей
const mockOwnerProfile: UserProfile = {
  user: {
    id: 1,
    email: "owner@pawpal.kz",
    role: Role.OWNER,
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-15T10:00:00"
  },
  petOwner: {
    id: 1,
    userId: 1,
    username: "Сабина",
    phoneNumber: "+7 777 123 4567",
    address: "г. Алматы, ул. Абая 123"
  }
};

const mockVetProfile: UserProfile = {
  user: {
    id: 2,
    email: "vet@pawpal.kz",
    role: Role.VET,
    status: UserStatus.ACTIVE,
    createdAt: "2024-01-20T10:00:00"
  },
  veterinarian: {
    vetId: 1,
    userId: 2,
    firstName: "Айгерим",
    lastName: "Нуржанова",
    phoneNumber: "+7 777 987 6543",
    licenseNumber: "VET-2024-001",
    clinicName: "ЗооВет Клиника",
    experienceYears: 8
  }
};

const mockServiceProfile: UserProfile = {
  user: {
    id: 3,
    email: "service@pawpal.kz",
    role: Role.SERVICE,
    status: UserStatus.ACTIVE,
    createdAt: "2024-02-01T10:00:00"
  },
  serviceProvider: {
    serviceProviderId: 1,
    userId: 3,
    firstName: "Мадина",
    lastName: "Ахметова",
    phoneNumber: "+7 775 555 1234",
    serviceCategory: "GROOMER"
  }
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  
  fetchProfile: async () => {
    set({ loading: true, error: null });
    
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Для демонстрации используем профиль владельца
      // В реальном приложении выбор зависит от авторизованного пользователя
      set({ profile: mockOwnerProfile, loading: false });
    } catch (error) {
      set({ error: "Ошибка загрузки профиля", loading: false });
    }
  },
  
  updateProfile: async (data) => {
    set({ loading: true });
    
    try {
      // Имитация обновления
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentProfile = get().profile;
      if (currentProfile) {
        set({ 
          profile: { ...currentProfile, ...data },
          loading: false 
        });
      }
    } catch (error) {
      set({ error: "Ошибка обновления профиля", loading: false });
    }
  },
  
  logout: () => {
    set({ profile: null });
  }
}));