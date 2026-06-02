// hooks/useUser.ts

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';


export type UserRole = 'OWNER' | 'VET' | 'SERVICE' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface DecodedToken {
  userId: number;
  id?: number;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  exp?: number;
}


const decodeToken = (token: string): DecodedToken | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId || payload.id || 0,
      id: payload.id || payload.userId,
      email: payload.email || '',
      role: payload.role || payload.userRole || 'OWNER',
      firstName: payload.firstName || payload.first_name,
      lastName: payload.lastName || payload.last_name,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const decoded = decodeToken(token);
    if (!decoded) return false;
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) return false;
    }
    return true;
  } catch {
    return false;
  }
};

// ============ ХУК ============

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserFromStorage = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      
      if (storedToken && isTokenValid(storedToken)) {
        setToken(storedToken);
        
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const decoded = decodeToken(storedToken);
          if (decoded) {
            const userFromToken: User = {
              id: decoded.userId,
              email: decoded.email,
              firstName: decoded.firstName || '',
              lastName: decoded.lastName || '',
              role: decoded.role,
            };
            setUser(userFromToken);
            await AsyncStorage.setItem('user', JSON.stringify(userFromToken));
          }
        }
        setIsAuthenticated(true);
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;
      
      await AsyncStorage.setItem('token', authToken);
      
      let finalUser: User;
      
      if (userData) {
        finalUser = userData;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        const decoded = decodeToken(authToken);
        if (!decoded) {
          throw new Error('Invalid token');
        }
        finalUser = {
          id: decoded.userId,
          email: decoded.email,
          firstName: decoded.firstName || '',
          lastName: decoded.lastName || '',
          role: decoded.role,
        };
        await AsyncStorage.setItem('user', JSON.stringify(finalUser));
      }
      
      setToken(authToken);
      setUser(finalUser);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;  
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: authToken, user: newUser } = response.data;
      
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(authToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
      await AsyncStorage.multiRemove(['token', 'user']);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await api.put('/users/me', updates);
      const updatedUser = { ...user, ...response.data };
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [user]);

  const getCurrentUserId = useCallback((): number => {
    return user?.id || 0;
  }, [user]);

  const getUserRole = useCallback((): UserRole => {
    return user?.role || 'OWNER';
  }, [user]);

  const isOwner = useCallback((): boolean => {
    return user?.role === 'OWNER';
  }, [user]);

  const isSpecialist = useCallback((): boolean => {
    const role = user?.role;
    return role === 'VET' || role === 'SERVICE';
  }, [user]);

  const isVet = useCallback((): boolean => {
    return user?.role === 'VET';
  }, [user]);

  const isService = useCallback((): boolean => {
    return user?.role === 'SERVICE';
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    return user?.role === 'ADMIN';
  }, [user]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    getCurrentUserId,
    getUserRole,
    isOwner,
    isSpecialist,   
    isVet,          
    isService,     
    isAdmin,
    reload: loadUserFromStorage,
  };
};


export const useUserId = (): number => {
  const { getCurrentUserId } = useUser();
  return getCurrentUserId();
};

export const useUserRole = (): UserRole => {
  const { getUserRole } = useUser();
  return getUserRole();
};

export const useAuth = () => {
  const { isAuthenticated, loading, user, login, logout, register } = useUser();
  return { isAuthenticated, loading, user, login, logout, register };
};

export const useProtectedRoute = (allowedRoles?: UserRole[]) => {
  const { isAuthenticated, user, loading, getUserRole } = useUser();
  
  const hasAccess = useCallback(() => {
    if (!isAuthenticated) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(getUserRole());
  }, [isAuthenticated, allowedRoles, getUserRole]);
  
  return {
    isAuthenticated,
    loading,
    user,
    hasAccess: hasAccess(),
    userRole: getUserRole(),
  };
};

export default useUser;