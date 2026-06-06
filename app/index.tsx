import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { User } from "@/types/profile";

// Константы маршрутов
const ROUTES = {
  OWNER_COMPLETE: '/complete_profile',
  VET_COMPLETE: '/complete_vet',
  SERVICE_COMPLETE: '/complete_service',
  OWNER_MAIN: '/(owner)',
  SPECIALIST_MAIN: '/(specialist)',
  ADMIN_MAIN: '/(admin)/admin-main',
  LOGIN: '/(auth)/login',
} as const;

// Функция для извлечения строки роли
const extractRoleString = (user: User | null): string => {
  if (!user?.role) return '';
  return user.role as string;
};

export default function Index() {
  const { 
    token, 
    user, 
    isLoading: isAuthLoading, 
    isInitialized 
  } = useAuthStore();
  
  const { 
    profile, 
    isLoading: isProfileLoading, 
    fetchProfile,
    error: profileError 
  } = useProfileStore();

  // Если пользователь есть, но профиль не загружен - загружаем
  useEffect(() => {
    if (isInitialized && user && !profile && !isProfileLoading && !profileError) {
      console.log('🔄 Loading profile for user:', user.id);
      fetchProfile(user).catch(err => {
        console.log('Profile fetch error in index:', err?.response?.status);
      });
    }
  }, [isInitialized, user, profile, isProfileLoading, profileError, fetchProfile]);

  // Показываем загрузку, пока данные не готовы
  if (!isInitialized || isAuthLoading || (user && !profile && isProfileLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E3275B" />
      </View>
    );
  }

  // Если нет токена или пользователя - на логин
  if (!token || !user) {
    console.log('🔐 No token or user, redirecting to login');
    return <Redirect href={ROUTES.LOGIN} />;
  }

  const roleString = extractRoleString(user);
  
  if (!roleString) {
    console.warn('⚠️ Role not defined for user:', user);
    return <Redirect href={ROUTES.LOGIN} />;
  }

  console.log('📍 User role:', roleString);
  console.log('📍 Has profile:', !!profile);
  console.log('📍 Profile data:', profile ? 'exists' : 'null');

  // Проверяем, заполнен ли профиль
  const hasProfile = !!(profile?.petOwner || profile?.veterinarian || profile?.serviceProvider);

  // Если профиль не заполнен - на страницу заполнения
  if (!hasProfile) {
    console.log('🆕 Profile not complete, redirecting to completion');
    switch (roleString) {
      case "OWNER":
        return <Redirect href={ROUTES.OWNER_COMPLETE} />;
      case "VET":
        return <Redirect href={ROUTES.VET_COMPLETE} />;
      case "SERVICE":
        return <Redirect href={ROUTES.SERVICE_COMPLETE} />;
      default:
        console.error('❌ Unknown role for profile completion:', roleString);
        return <Redirect href={ROUTES.LOGIN} />;
    }
  }

  // Профиль есть - редирект на главный экран по роли
  console.log('✅ Profile complete, redirecting to main app');
  switch (roleString) {
    case "OWNER":
      return <Redirect href={ROUTES.OWNER_MAIN} />;
    case "VET":
    case "SERVICE":
      return <Redirect href={ROUTES.SPECIALIST_MAIN} />;
    case "ADMIN":
      return <Redirect href={ROUTES.ADMIN_MAIN} />;
    default:
      console.error('❌ Unknown role for main redirect:', roleString);
      return <Redirect href={ROUTES.LOGIN} />;
  }
}