import { create } from 'zustand';
import api from '@/services/api';
import { 
  UserProfile, 
  CompleteProfileData, 
  Role,
  User,
  PetOwner,
  Veterinarian,
  ServiceProvider,
  UserStatus

} from '@/types/profile';
import i18n from '@/app/i18n';


type ApiResponse = PetOwner | Veterinarian | ServiceProvider;

interface ProfileStore {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  fetchProfile: (authUser: User | null) => Promise<void>;
  createProfile: (authUser: User | null, data: CompleteProfileData) => Promise<boolean>;
  updateProfile: (authUser: User | null, data: Partial<CompleteProfileData>) => Promise<boolean>;
  clearProfile: () => void;
}



const extractRoleString = (authUser: User | null): string => {
  if (!authUser?.role) {
    throw new Error(i18n.t('profile.userOrRoleMissing'));
  }
  

  return authUser.role as string;
};

const getProfileEndpoint = (roleString: string): string => {
  switch (roleString) {
    case Role.OWNER:
      return '/pet-management/api/pet-owners/me';
    case Role.VET:
      return '/specialist-service/veterinarians/me';
    case Role.SERVICE:
      return '/specialist-service/service-providers/me';
    default:
      throw new Error(`Unknown role: ${roleString}`);
  }
};


const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName?.trim().split(/\s+/) || [];
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};


const transformProfileData = (
  roleString: Role, 
  data: CompleteProfileData
): Omit<PetOwner, 'id' | 'userId' | 'avatarUrl'> | 
   Omit<Veterinarian, 'vetId' | 'userId' | 'avatarUrl' | 'patientsCount' | 'ratingAverage' | 'reviewsCount'> | 
   Omit<ServiceProvider, 'serviceProviderId' | 'userId' | 'avatarUrl' | 'ratingAverage' | 'reviewsCount' | 'patientsCount'> => {
  
  switch (roleString) {
    case Role.OWNER:
      return {
        username: data.username,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };
      
    case Role.VET: {
      const { firstName, lastName } = splitFullName(data.username);
      return {
        firstName,
        lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };
    }
      
    case Role.SERVICE: {
      const { firstName, lastName } = splitFullName(data.username);
      return {
        firstName,
        lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };
    }
      
    default:
      throw new Error(`Unknown role: ${roleString}`);
  }
};


const updateProfileInStore = (
  currentProfile: UserProfile | null,
  authUser: User,
  roleString: Role,
  responseData: ApiResponse
): UserProfile => {
  const profileData: UserProfile = { user: authUser };
  
  switch (roleString) {
    case Role.OWNER:
      profileData.petOwner = responseData as PetOwner;
      break;
    case Role.VET:
      profileData.veterinarian = responseData as Veterinarian;
      break;
    case Role.SERVICE:
      profileData.serviceProvider = responseData as ServiceProvider;
      break;
  }
  
  return profileData;
};


const getCurrentUsername = (profile: UserProfile | null, roleString: Role): string => {
  if (!profile) return '';
  
  switch (roleString) {
    case Role.OWNER:
      return profile.petOwner?.username || '';
    case Role.VET:
      const vet = profile.veterinarian;
      return vet ? `${vet.firstName} ${vet.lastName}`.trim() : '';
    case Role.SERVICE:
      const service = profile.serviceProvider;
      return service ? `${service.firstName} ${service.lastName}`.trim() : '';
    default:
      return '';
  }
};


const getCurrentPhoneNumber = (profile: UserProfile | null): string => {
  if (!profile) return '';
  return profile.petOwner?.phoneNumber || 
         profile.veterinarian?.phoneNumber || 
         profile.serviceProvider?.phoneNumber || '';
};


const getCurrentAddress = (profile: UserProfile | null): string => {
  if (!profile) return '';
  return profile.petOwner?.address || 
         profile.veterinarian?.address || 
         profile.serviceProvider?.address || '';
};

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,


fetchProfile: async (authUser) => {
  if (!authUser) {
    console.log("❌ fetchProfile: no authUser");
    set({ profile: null, error: 'Пользователь не авторизован' });
    return;
  }
  
  set({ isLoading: true, error: null });
  
  try {

    const roleString = extractRoleString(authUser);
    console.log(`📝 Fetching profile for role: ${roleString}`);
    
    const endpoint = getProfileEndpoint(roleString);
    const response = await api.get(endpoint);
    
    console.log('✅ Profile fetch response:', response.status);
    

    const profileData = updateProfileInStore(null, authUser, authUser.role, response.data);
    set({ profile: profileData, isLoading: false, error: null });
    
  } catch (error: any) {
    console.log(`❌ Profile fetch error: ${error?.response?.status}`);
    
    if (error?.response?.status === 404) {
      set({ profile: { user: authUser }, isLoading: false, error: null });
      throw error;
    } else {
      set({ error: 'Не удалось загрузить профиль', isLoading: false });
      throw error;
    }
  }
},

  createProfile: async (authUser, data) => {
    if (!authUser) {
      set({ error: 'Пользователь не авторизован' });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const roleString = authUser.role;
      const endpoint = getProfileEndpoint(roleString);
      const transformedData = transformProfileData(roleString, data);
      
      const response = await api.post<ApiResponse>(endpoint, transformedData);
      
      const profileData = updateProfileInStore(null, authUser, roleString, response.data);
      
      set({ profile: profileData, isLoading: false, error: null });
      console.log("✅ Profile created successfully");
      return true;
      
    } catch (error: any) {
      console.error("❌ Profile creation error:", error?.response?.status);
      const errorMessage = error?.response?.data?.message || 'Не удалось создать профиль';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateProfile: async (authUser, data) => {
    const currentProfile = get().profile;
    
    if (!authUser || !currentProfile) {
      set({ error: 'Пользователь не авторизован или профиль не загружен' });
      return false;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const roleString = authUser.role;
      const endpoint = getProfileEndpoint(roleString);
      

      const finalData: CompleteProfileData = {
        username: data.username || getCurrentUsername(currentProfile, roleString),
        phoneNumber: data.phoneNumber || getCurrentPhoneNumber(currentProfile),
        address: data.address || getCurrentAddress(currentProfile),
      };
      
      const transformedData = transformProfileData(roleString, finalData);
      const response = await api.put<ApiResponse>(endpoint, transformedData);
      
      const updatedProfile = updateProfileInStore(currentProfile, authUser, roleString, response.data);
      
      set({ profile: updatedProfile, isLoading: false, error: null });
      console.log("✅ Profile updated successfully");
      return true;
      
    } catch (error: any) {
      console.error("❌ Profile update error:", error?.response?.status);
      const errorMessage = error?.response?.data?.message || 'Не удалось обновить профиль';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearProfile: () => {
    set({ profile: null, isLoading: false, error: null });
  },
}));