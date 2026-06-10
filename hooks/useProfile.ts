import { useEffect, useCallback, useMemo, useState } from 'react';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore';
import { CompleteProfileData, PetOwner, Veterinarian, ServiceProvider, UserProfile , User } from '@/types/profile';

interface UseProfileReturn {

  profile: UserProfile | null;
  user: User | null;
  petOwner: PetOwner | undefined;
  veterinarian: Veterinarian | undefined;
  serviceProvider: ServiceProvider | undefined;
  

  isLoading: boolean;
  error: string | null;
  hasProfile: boolean;
  needsProfileCompletion: boolean;
  
  getDisplayName: () => string;
  getUsername: () => string;
  getPhoneNumber: () => string;
  getAddress: () => string;
  getAvatar: () => string | undefined;
  getRating: () => number;
  getExperience: () => number;
  getFullName: () => { firstName: string; lastName: string };
  getServiceCategory: () => string;
  getCity: () => string;
  getEducation: () => string;
  getPricePerVisit: () => number;
  getAbout: () => string;
  getClinicName: () => string;
  getLicenseNumber: () => string;
  getPatientsCount: () => number;
  getReviewsCount: () => number;
  
  saveProfile: (data: CompleteProfileData) => Promise<boolean>;
  editProfile: (data: Partial<CompleteProfileData>) => Promise<boolean>;
  refetch: () => Promise<void>;
  clearProfile: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const { 
    profile, 
    isLoading, 
    error, 
    fetchProfile, 
    createProfile, 
    updateProfile,
    clearProfile 
  } = useProfileStore();
  
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const user = useAuthStore((state) => state.user);
  
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  

  
  useEffect(() => {
    if (isAuthenticated && user && !profile && !isLoading && !hasAttemptedLoad) {
      setHasAttemptedLoad(true);
      fetchProfile(user);
    }
  }, [isAuthenticated, user, profile, isLoading, fetchProfile, hasAttemptedLoad]);
  
  useEffect(() => {
    setHasAttemptedLoad(false);
  }, [user?.id]);
  

  
  const hasProfile = useMemo(
    () => !!(profile?.petOwner || profile?.veterinarian || profile?.serviceProvider),
    [profile]
  );
  
  const needsProfileCompletion = useMemo(
    () => isAuthenticated && !!user && !hasProfile && !isLoading && !error,
    [isAuthenticated, user, hasProfile, isLoading, error]
  );
  

  
  const getProfileData = useCallback(() => {
    if (profile?.petOwner) return { type: 'OWNER' as const, data: profile.petOwner };
    if (profile?.veterinarian) return { type: 'VET' as const, data: profile.veterinarian };
    if (profile?.serviceProvider) return { type: 'SERVICE' as const, data: profile.serviceProvider };
    return null;
  }, [profile]);
  

  
  const getDisplayName = useCallback((): string => {
    const profileData = getProfileData();
    
    if (!profileData) {
      return user?.email || '';
    }
    
    if (profileData.type === 'OWNER') {
      return profileData.data.username || '';
    }
    

    const data = profileData.data as Veterinarian | ServiceProvider;
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    
    if (firstName && lastName) return `${firstName} ${lastName}`.trim();
    return firstName || lastName || user?.email || '';
  }, [getProfileData, user]);
  
  const getUsername = useCallback((): string => {
    const profileData = getProfileData();
    
    if (!profileData) return '';
    
    if (profileData.type === 'OWNER') {
      return profileData.data.username || '';
    }
    

    const data = profileData.data as Veterinarian | ServiceProvider;
    return `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }, [getProfileData]);
  
  const getPhoneNumber = useCallback((): string => {
    const profileData = getProfileData();
    
    if (!profileData) return '';
    
    if (profileData.type === 'OWNER') {
      return (profileData.data as PetOwner).phoneNumber || '';
    }
    
    return (profileData.data as Veterinarian | ServiceProvider).phoneNumber || '';
  }, [getProfileData]);
  
  const getAddress = useCallback((): string => {
    const profileData = getProfileData();
    
    if (!profileData) return '';
    
    if (profileData.type === 'OWNER') {
      return (profileData.data as PetOwner).address || '';
    }
    
    return (profileData.data as Veterinarian | ServiceProvider).address || '';
  }, [getProfileData]);
  
  const getAvatar = useCallback((): string | undefined => {
    const profileData = getProfileData();
    if (!profileData) return undefined;
    
    if (profileData.type === 'OWNER') {
      return (profileData.data as PetOwner).avatarUrl;
    }
    
    return (profileData.data as Veterinarian | ServiceProvider).avatarUrl;
  }, [getProfileData]);
  
  const getRating = useCallback((): number => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return 0;
    
    return (profileData.data as Veterinarian | ServiceProvider).ratingAverage || 0;
  }, [getProfileData]);
  
  const getExperience = useCallback((): number => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return 0;
    
    return (profileData.data as Veterinarian | ServiceProvider).experienceYears || 0;
  }, [getProfileData]);
  
  const getFullName = useCallback((): { firstName: string; lastName: string } => {
    const profileData = getProfileData();
    
    if (!profileData) return { firstName: '', lastName: '' };
    
    if (profileData.type === 'OWNER') {
      const username = (profileData.data as PetOwner).username || '';
      const parts = username.trim().split(/\s+/);
      return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
      };
    }
    

    const data = profileData.data as Veterinarian | ServiceProvider;
    return {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
    };
  }, [getProfileData]);
  
  const getServiceCategory = useCallback((): string => {
    if (profile?.serviceProvider) {
      return profile.serviceProvider.serviceCategory || '';
    }
    return '';
  }, [profile?.serviceProvider]);
  
  const getCity = useCallback((): string => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return '';
    
    return (profileData.data as Veterinarian | ServiceProvider).city || '';
  }, [getProfileData]);
  
  const getEducation = useCallback((): string => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return '';
    
    return (profileData.data as Veterinarian | ServiceProvider).education || '';
  }, [getProfileData]);
  
  const getPricePerVisit = useCallback((): number => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return 0;
    
    return (profileData.data as Veterinarian | ServiceProvider).pricePerVisit || 0;
  }, [getProfileData]);
  
  const getAbout = useCallback((): string => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return '';
    
    return (profileData.data as Veterinarian | ServiceProvider).about || '';
  }, [getProfileData]);
  
  const getClinicName = useCallback((): string => {
    if (profile?.veterinarian) {
      return profile.veterinarian.clinicName || '';
    }
    return '';
  }, [profile?.veterinarian]);
  
  const getLicenseNumber = useCallback((): string => {
    if (profile?.veterinarian) {
      return profile.veterinarian.licenseNumber || '';
    }
    return '';
  }, [profile?.veterinarian]);
  
  const getPatientsCount = useCallback((): number => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return 0;
    
    return (profileData.data as Veterinarian | ServiceProvider).patientsCount || 0;
  }, [getProfileData]);
  
  const getReviewsCount = useCallback((): number => {
    const profileData = getProfileData();
    if (!profileData || profileData.type === 'OWNER') return 0;
    
    return (profileData.data as Veterinarian | ServiceProvider).reviewsCount || 0;
  }, [getProfileData]);
  

  
  const saveProfile = useCallback(async (data: CompleteProfileData): Promise<boolean> => {
    if (!user) {
      console.error('No user to create profile for');
      return false;
    }
    const success = await createProfile(user, data);
    if (success) {
      setHasAttemptedLoad(false); 
    }
    return success;
  }, [createProfile, user]);
  
  const editProfile = useCallback(async (data: Partial<CompleteProfileData>): Promise<boolean> => {
    if (!user) {
      console.error('No user to update profile for');
      return false;
    }
    return await updateProfile(user, data);
  }, [updateProfile, user]);
  
  const refetch = useCallback(async (): Promise<void> => {
    if (user) {
      setHasAttemptedLoad(true);
      await fetchProfile(user);
    }
  }, [fetchProfile, user]);
  

  
  return {

    profile,
    user,
    petOwner: profile?.petOwner,
    veterinarian: profile?.veterinarian,
    serviceProvider: profile?.serviceProvider,
    

    isLoading,
    error,
    hasProfile,
    needsProfileCompletion,

    getDisplayName,
    getUsername,
    getPhoneNumber,
    getAddress,
    getAvatar,
    getRating,
    getExperience,
    getFullName,
    getServiceCategory,
    getCity,
    getEducation,
    getPricePerVisit,
    getAbout,
    getClinicName,
    getLicenseNumber,
    getPatientsCount,
    getReviewsCount,
    

    saveProfile,
    editProfile,
    refetch,
    clearProfile,
  };
};