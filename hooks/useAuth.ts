import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Role, User } from '@/types/profile';
import { RegisterData } from '@/types/auth';

const ROUTES = {
  ADMIN_MAIN: '/(admin)/admin-main',
  SPECIALIST_MAIN: '/(specialist)',
  OWNER_MAIN: '/(owner)',
  COMPLETE_PROFILE: '/complete_profile',
  COMPLETE_VET: '/complete_vet',
  COMPLETE_SERVICE: '/complete_service',
  LOGIN: '/(auth)/login',
} as const;


const extractRoleString = (role: Role | string | { name: string } | undefined): string => {
  if (!role) return '';
  
  if (typeof role === 'string') {
    return role;
  }
  
  if (typeof role === 'object' && 'name' in role && role.name) {
    return role.name;
  }
  
  return '';
};

const getMainRouteByRole = (role: string): typeof ROUTES[keyof typeof ROUTES] => {
  switch (role) {
    case Role.ADMIN: 
      return ROUTES.ADMIN_MAIN;
    case Role.VET:
    case Role.SERVICE: 
      return ROUTES.SPECIALIST_MAIN;
    case Role.OWNER:
    default: 
      return ROUTES.OWNER_MAIN;
  }
};

const getCompleteRouteByRole = (role: string): typeof ROUTES.COMPLETE_PROFILE | typeof ROUTES.COMPLETE_VET | typeof ROUTES.COMPLETE_SERVICE => {
  switch (role) {
    case Role.OWNER: return ROUTES.COMPLETE_PROFILE;
    case Role.VET: return ROUTES.COMPLETE_VET;
    case Role.SERVICE: return ROUTES.COMPLETE_SERVICE;
    default: return ROUTES.COMPLETE_PROFILE;
  }
};


export const useCurrentUser = (): User | null => {
  return useAuthStore((state) => state.user);
};

export const useAuthToken = (): string | null => {
  return useAuthStore((state) => state.token);
};

export const useAuthLoading = (): boolean => {
  return useAuthStore((state) => state.isLoading);
};

export const useAuthError = (): string | null => {
  return useAuthStore((state) => state.error);
};


export const useUserRole = () => {
  const user = useAuthStore((state) => state.user);
  const roleString = extractRoleString(user?.role);
  
  return useMemo(() => ({
    role: user?.role,
    roleString,
    status: user?.status,
    isOwner: roleString === Role.OWNER,
    isVet: roleString === Role.VET,
    isService: roleString === Role.SERVICE,
    isAdmin: roleString === Role.ADMIN,
    isSpecialist: roleString === Role.VET || roleString === Role.SERVICE,
  }), [user, roleString]);
};


export const useAuthActions = () => {
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const clearError = useAuthStore((state) => state.clearError);
  
  return useMemo(() => ({
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  }), [login, register, logout, fetchCurrentUser, clearError]);
};


export const useLoginWithRedirect = () => {
  const login = useAuthStore((state) => state.login);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const router = useRouter();
  
  return useCallback(async (email: string, password: string) => {
    const success = await login(email, password);
    
    if (success) {
      const user = useAuthStore.getState().user;
      
      if (!user) {
        console.error('User not found after login');
        return false;
      }
      
      const roleString = extractRoleString(user.role);
      console.log('User role after login:', roleString);
      
      // Админ сразу на админку
     if (roleString === Role.ADMIN) {
      router.replace(ROUTES.ADMIN_MAIN); 
      return true;
}
      
      try {
        await fetchProfile(user);
        console.log('✅ Profile exists, redirecting to main');
        router.replace(getMainRouteByRole(roleString));
      } catch (error: any) {
        if (error?.response?.status === 404) {
          console.log('🆕 Profile not found, redirecting to completion');
          const completeRoute = getCompleteRouteByRole(roleString);
          console.log('🆕 Complete route:', completeRoute);
          router.replace(completeRoute);
        } else {
          console.error('Profile check error:', error);
          router.replace(getMainRouteByRole(roleString));
        }
      }
      
      return true;
    }
    
    return false;
  }, [login, fetchProfile, router]);
};

export const useLogoutWithRedirect = () => {
  const logout = useAuthStore((state) => state.logout);
  const clearProfile = useProfileStore((state) => state.clearProfile);
  const router = useRouter();
  
  return useCallback(async () => {
    clearProfile();
    await logout();
    router.replace('/(auth)/login');
  }, [logout, clearProfile, router]);
};

export const useProtectedRoute = (allowedRoles?: Role[], requireProfileComplete?: boolean) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const profile = useProfileStore((state) => state.profile);
  const router = useRouter();
  
  const hasProfile = useMemo(() => 
    !!(profile?.petOwner || profile?.veterinarian || profile?.serviceProvider),
    [profile]
  );
  
  useEffect(() => {
    if (isLoading) return;
    

    if (!token || !user) {
      router.replace('/(auth)/login');
      return;
    }
    

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role;
      const hasAllowedRole = allowedRoles.some(allowedRole => allowedRole === userRole);
      
      if (!hasAllowedRole) {
        const roleString = extractRoleString(userRole);
        router.replace(getMainRouteByRole(roleString)); 
        return;
      }
    }
    

    if (requireProfileComplete && !hasProfile && user) {
      const roleString = extractRoleString(user.role);
      router.replace(getCompleteRouteByRole(roleString)); 
      return;
    }
  }, [isLoading, token, user, allowedRoles, router, requireProfileComplete, hasProfile]);
  
  const hasAccess = useMemo(() => {
    if (!token || !user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    
    const userRole = user.role;
    return allowedRoles.some(allowedRole => allowedRole === userRole);
  }, [token, user, allowedRoles]);
  
  return { 
    isAuthenticated: !!token && !!user, 
    isLoading,
    user,
    hasAccess,
    needsProfileCompletion: requireProfileComplete && !hasProfile && !!user,
  };
};



export const useRegisterWithRedirect = () => {
  const register = useAuthStore((state) => state.register);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const router = useRouter();
  
  const handleRegister = useCallback(async (data: RegisterData) => {
    const success = await register(data);
    
    if (success) {
      const user = useAuthStore.getState().user;
      
      if (!user) {
        console.error('User not found after registration');
        return false;
      }
      
      const roleString = extractRoleString(user.role);
      
      try {
        await fetchProfile(user);
        router.replace(getMainRouteByRole(roleString));
      } catch (error: any) {
        if (error?.response?.status === 404) {
          router.replace(getCompleteRouteByRole(roleString));
        } else {
          console.error('Profile check error:', error);
          router.replace(getMainRouteByRole(roleString));
        }
      }
      
      return true;
    }
    
    return false;
  }, [register, fetchProfile, router]);
  
  return {
    register: handleRegister,
    isLoading,
    error,
    clearError,
  };
};


export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const roleString = extractRoleString(user?.role);
  
  return useMemo(() => ({
    isOwner: roleString === Role.OWNER,
    isVet: roleString === Role.VET,
    isService: roleString === Role.SERVICE,
    isAdmin: roleString === Role.ADMIN,
    isSpecialist: roleString === Role.VET || roleString === Role.SERVICE,
    canEditContent: roleString === Role.ADMIN || roleString === Role.VET,
    canViewAdminPanel: roleString === Role.ADMIN,
    canManageAppointments: roleString === Role.VET || roleString === Role.SERVICE,
    canViewAnalytics: roleString === Role.ADMIN,
  }), [roleString]);
};