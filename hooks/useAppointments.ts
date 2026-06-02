// hooks/useAppointments.ts - ПОЛНАЯ ВЕРСИЯ С ОБОГАЩЕНИЕМ ДАННЫХ

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { appointmentApi } from '@/services/appointmentApi';
import { 
  AppointmentResponseDto, 
  AppointmentFilters, 
  AppointmentRecommendationsDto,
  AppointmentUpdateDto,
} from '@/types/appointment.types';
import { useUser } from './useUser';
import api from '@/services/api';

// ============ ТИПЫ ============

export type UseAppointmentsMode = 'owner' | 'specialist' | 'details';

export interface UseAppointmentsConfig {
  mode: UseAppointmentsMode;
  appointmentId?: number; 
  filters?: AppointmentFilters;
  autoLoad?: boolean; 
  pageSize?: number; 
}

export interface UseAppointmentsReturn {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  
  // Для режимов 'owner' и 'specialist'
  appointments?: any[];
  hasMore?: boolean;
  totalPages?: number;
  currentPage?: number;
  loadMore?: () => void;
  
  // Специфичные для 'owner'
  cancelAppointment?: (id: number, reason: string) => Promise<boolean>;
  
  // Специфичные для 'specialist'
  createdCount?: number;
  confirmAppointment?: (id: number) => Promise<AppointmentResponseDto>;
  cancelBySpecialist?: (id: number, reason: string) => Promise<void>;
  completeAppointment?: (id: number) => Promise<void>;
  markAsNoShow?: (id: number) => Promise<AppointmentResponseDto>;
  addRecommendations?: (id: number, recommendations: AppointmentRecommendationsDto) => Promise<AppointmentResponseDto>;
  
  // Для режима 'details'
  appointment?: any;
  recommendations?: string | null;
  updateAppointment?: (data: AppointmentUpdateDto) => Promise<AppointmentResponseDto>;
}

// ============ КЭШИ ДЛЯ ДАННЫХ ИЗ ДРУГИХ СЕРВИСОВ ============

interface UserData {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PetData {
  name: string;
  species: string;
  breed?: string;
}

const userCache = new Map<number, UserData>();
const petCache = new Map<number, PetData>();

// ============ ФУНКЦИИ ОБОГАЩЕНИЯ ============

/**
 * Обогащает одну запись (для деталей)
 */
const enrichSingleAppointment = async (appointment: any): Promise<any> => {
  if (!appointment) return null;
  
  // Загружаем данные специалиста
  let specialistName = '';
  if (userCache.has(appointment.specialistId)) {
    const user = userCache.get(appointment.specialistId)!;
    specialistName = `${user.firstName} ${user.lastName}`.trim();
  } else {
    try {
      const response = await api.get(`/users/${appointment.specialistId}`);
      const user = response.data;
      const userData = {
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        phone: user.phone || user.phoneNumber,
      };
      userCache.set(appointment.specialistId, userData);
      specialistName = `${userData.firstName} ${userData.lastName}`.trim();
    } catch (error) {
      console.error('Failed to load specialist:', error);
      specialistName = `Специалист #${appointment.specialistId}`;
    }
  }
  
  // Загружаем данные владельца
  let petOwnerName = '';
  if (userCache.has(appointment.petOwnerId)) {
    const user = userCache.get(appointment.petOwnerId)!;
    petOwnerName = `${user.firstName} ${user.lastName}`.trim();
  } else {
    try {
      const response = await api.get(`/users/${appointment.petOwnerId}`);
      const user = response.data;
      const userData = {
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        phone: user.phone || user.phoneNumber,
      };
      userCache.set(appointment.petOwnerId, userData);
      petOwnerName = `${userData.firstName} ${userData.lastName}`.trim();
    } catch (error) {
      console.error('Failed to load owner:', error);
      petOwnerName = `Владелец #${appointment.petOwnerId}`;
    }
  }
  
  // Загружаем данные питомца
  let petName = 'Не указан';
  let petType = 'Не указан';
  let petBreed = '';
  
  if (petCache.has(appointment.petId)) {
    const pet = petCache.get(appointment.petId)!;
    petName = pet.name;
    petType = pet.species;
    petBreed = pet.breed || '';
  } else {
    try {
      const response = await api.get(`/pets/${appointment.petId}`);
      const pet = response.data;
      const petData = {
        name: pet.name || 'Unknown',
        species: pet.species || pet.type || 'Unknown',
        breed: pet.breed,
      };
      petCache.set(appointment.petId, petData);
      petName = petData.name;
      petType = petData.species;
      petBreed = petData.breed || '';
    } catch (error) {
      console.error('Failed to load pet:', error);
    }
  }
  
  return {
    ...appointment,
    specialistName,
    petOwnerName,
    petName,
    petType,
    petBreed,
  };
};

/**
 * Обогащает список записей (для списка)
 */
const enrichAppointmentsBatch = async (rawAppointments: any[]): Promise<any[]> => {
  if (!rawAppointments.length) return [];
  
  try {
    // Собираем уникальные ID
    const uniqueSpecialistIds = [...new Set(rawAppointments.map(a => a.specialistId))];
    const uniqueOwnerIds = [...new Set(rawAppointments.map(a => a.petOwnerId))];
    const uniquePetIds = [...new Set(rawAppointments.map(a => a.petId))];
    
    // Загружаем всех специалистов
    const specialistPromises = uniqueSpecialistIds.map(async (specId) => {
      if (userCache.has(specId)) {
        return { id: specId, data: userCache.get(specId)! };
      }
      try {
        const response = await api.get(`/users/${specId}`);
        const user = response.data;
        const userData = {
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
          phone: user.phone || user.phoneNumber,
        };
        userCache.set(specId, userData);
        return { id: specId, data: userData };
      } catch (error) {
        console.error(`Failed to load specialist ${specId}:`, error);
        return { id: specId, data: { firstName: 'Unknown', lastName: '' } };
      }
    });
    
    // Загружаем всех владельцев
    const ownerPromises = uniqueOwnerIds.map(async (ownerId) => {
      if (userCache.has(ownerId)) {
        return { id: ownerId, data: userCache.get(ownerId)! };
      }
      try {
        const response = await api.get(`/users/${ownerId}`);
        const user = response.data;
        const userData = {
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
          phone: user.phone || user.phoneNumber,
        };
        userCache.set(ownerId, userData);
        return { id: ownerId, data: userData };
      } catch (error) {
        console.error(`Failed to load owner ${ownerId}:`, error);
        return { id: ownerId, data: { firstName: 'Unknown', lastName: '' } };
      }
    });
    
    // Загружаем всех питомцев
    const petPromises = uniquePetIds.map(async (petId) => {
      if (petCache.has(petId)) {
        return { id: petId, data: petCache.get(petId)! };
      }
      try {
        const response = await api.get(`/pets/${petId}`);
        const pet = response.data;
        const petData = {
          name: pet.name || 'Unknown',
          species: pet.species || pet.type || 'Unknown',
          breed: pet.breed,
        };
        petCache.set(petId, petData);
        return { id: petId, data: petData };
      } catch (error) {
        console.error(`Failed to load pet ${petId}:`, error);
        return { id: petId, data: { name: 'Unknown', species: 'Unknown', breed: undefined } };
      }
    });
    
    const [specialists, owners, pets] = await Promise.all([
      Promise.all(specialistPromises),
      Promise.all(ownerPromises),
      Promise.all(petPromises),
    ]);
    
    const specialistMap = new Map(specialists.map(s => [s.id, s.data]));
    const ownerMap = new Map(owners.map(o => [o.id, o.data]));
    const petMap = new Map(pets.map(p => [p.id, p.data]));
    
    // Обогащаем записи
    const enriched = rawAppointments.map((apt) => {
      const specialist = specialistMap.get(apt.specialistId);
      const owner = ownerMap.get(apt.petOwnerId);
      const pet = petMap.get(apt.petId);
      
      return {
        ...apt,
        specialistName: specialist ? `${specialist.firstName} ${specialist.lastName}`.trim() : `Специалист #${apt.specialistId}`,
        petOwnerName: owner ? `${owner.firstName} ${owner.lastName}`.trim() : `Владелец #${apt.petOwnerId}`,
        petName: pet?.name || 'Не указан',
        petType: pet?.species || 'Не указан',
        petBreed: pet?.breed || '',
      };
    });
    
    return enriched;
  } catch (error) {
    console.error('Error enriching appointments:', error);
    return rawAppointments;
  }
};

// ============ ОСНОВНОЙ ХУК ============

export const useAppointments = (config: UseAppointmentsConfig): UseAppointmentsReturn => {
  const { mode, appointmentId, filters, autoLoad = true, pageSize = 10 } = config;
  
  const { getCurrentUserId } = useUser();
  const isMountedRef = useRef(true);
  
  // Общие состояния
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для owner и specialist режимов
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [createdCount, setCreatedCount] = useState(0);
  const [enriching, setEnriching] = useState(false);
  
  // Состояния для details режима
  const [appointment, setAppointment] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  
  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
  
  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const message = error?.message || defaultMessage;
    setError(message);
    Alert.alert('Ошибка', message);
  }, []);
  
  const updateIfMounted = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);
  
  // ============ ЗАГРУЗКА ДЛЯ РЕЖИМА OWNER ============
  
  const loadOwnerAppointments = useCallback(async (page: number = 0, shouldRefresh: boolean = false) => {
    try {
      updateIfMounted(() => {
        setError(null);
        if (shouldRefresh) {
          setRefreshing(true);
        } else if (page === 0) {
          setLoading(true);
        }
      });
      
      const response = await appointmentApi.getMyAppointments({
        ...filters,
        page,
        size: pageSize,
      });
      
      const newContent = response.content || [];
      
      updateIfMounted(() => {
        if (page === 0 || shouldRefresh) {
          setAppointments(newContent);
        } else {
          setAppointments(prev => [...prev, ...newContent]);
        }
        
        setTotalPages(response.totalPages || 0);
        setCurrentPage(response.number || page);
        setHasMore(!response.last && newContent.length > 0);
      });
    } catch (error: any) {
      updateIfMounted(() => handleError(error, 'Не удалось загрузить записи'));
    } finally {
      updateIfMounted(() => {
        setLoading(false);
        setRefreshing(false);
      });
    }
  }, [filters, pageSize, handleError, updateIfMounted]);
  
  // ============ ЗАГРУЗКА ДЛЯ РЕЖИМА SPECIALIST ============
  
  const loadSpecialistAppointments = useCallback(async (shouldRefresh: boolean = false) => {
    try {
      updateIfMounted(() => {
        setError(null);
        if (shouldRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      });
      
      const allResponse = await appointmentApi.getSpecialistAppointments(filters);
      const createdResponse = await appointmentApi.getSpecialistAppointments({ 
        status: 'CREATED', 
        size: 1 
      });
      
      const rawAppointments = allResponse.content || [];
      
      updateIfMounted(() => {
        setAppointments(rawAppointments);
        setTotalPages(allResponse.totalPages || 0);
        setCreatedCount(createdResponse.totalElements || 0);
      });
      
      // Обогащаем данные
      if (rawAppointments.length > 0) {
        setEnriching(true);
        const enriched = await enrichAppointmentsBatch(rawAppointments);
        updateIfMounted(() => {
          setAppointments(enriched);
        });
        setEnriching(false);
      }
      
    } catch (error: any) {
      updateIfMounted(() => handleError(error, 'Не удалось загрузить записи'));
    } finally {
      updateIfMounted(() => {
        setLoading(false);
        setRefreshing(false);
      });
    }
  }, [filters, handleError, updateIfMounted]);
  
  // ============ ЗАГРУЗКА ДЛЯ РЕЖИМА DETAILS ============
  
  const loadAppointmentDetails = useCallback(async () => {
    if (!appointmentId || appointmentId === 0) return;
    
    try {
      updateIfMounted(() => {
        setLoading(true);
        setError(null);
      });
      
      const [data, recData] = await Promise.all([
        appointmentApi.getAppointmentById(appointmentId),
        appointmentApi.getRecommendations(appointmentId)
      ]);
      
      // Обогащаем данные
      const enriched = await enrichSingleAppointment(data);
      
      updateIfMounted(() => {
        setAppointment(enriched);
        setRecommendations(recData);
      });
    } catch (error: any) {
      updateIfMounted(() => handleError(error, 'Не удалось загрузить детали записи'));
    } finally {
      updateIfMounted(() => setLoading(false));
    }
  }, [appointmentId, handleError, updateIfMounted]);
  
  // ============ ОБЩИЕ ДЕЙСТВИЯ ============
  
  const refresh = useCallback(() => {
    switch (mode) {
      case 'owner':
        loadOwnerAppointments(0, true);
        break;
      case 'specialist':
        loadSpecialistAppointments(true);
        break;
      case 'details':
        loadAppointmentDetails();
        break;
    }
  }, [mode, loadOwnerAppointments, loadSpecialistAppointments, loadAppointmentDetails]);
  
  const loadMore = useCallback(() => {
    if (mode === 'owner' && hasMore && !loading && !refreshing) {
      loadOwnerAppointments(currentPage + 1);
    }
  }, [mode, hasMore, loading, refreshing, currentPage, loadOwnerAppointments]);
  
  // ============ ДЕЙСТВИЯ ДЛЯ ВЛАДЕЛЬЦА ============
  
  const cancelAppointment = useCallback(async (id: number, reason: string): Promise<boolean> => {
    try {
      await appointmentApi.cancelAppointment(id, reason);
      
      updateIfMounted(() => {
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status: 'CANCELLED_BY_USER', cancellationReason: reason } : apt
        ));
      });
      
      Alert.alert('Успех', 'Запись успешно отменена');
      return true;
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось отменить запись');
      return false;
    }
  }, [updateIfMounted]);
  
  // ============ ДЕЙСТВИЯ ДЛЯ СПЕЦИАЛИСТА ============
  
  const confirmAppointment = useCallback(async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const updated = await appointmentApi.confirmAppointment(id);
      updateIfMounted(() => {
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updated } : apt));
        setCreatedCount(prev => Math.max(0, prev - 1));
      });
      Alert.alert('Успех', 'Запись подтверждена');
      return updated;
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось подтвердить запись');
      throw error;
    }
  }, [updateIfMounted]);
  
  const cancelBySpecialist = useCallback(async (id: number, reason: string): Promise<void> => {
    try {
      await appointmentApi.cancelAppointment(id, `Rejected by specialist: ${reason}`);
      
      updateIfMounted(() => {
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status: 'CANCELLED_BY_SPECIALIST' } : apt
        ));
        setCreatedCount(prev => Math.max(0, prev - 1));
      });
      Alert.alert('Успех', 'Запись отклонена');
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось отклонить запись');
      throw error;
    }
  }, [updateIfMounted]);
  
  const completeAppointment = useCallback(async (id: number): Promise<void> => {
    try {
      await appointmentApi.completeAppointment(id);
      updateIfMounted(() => {
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status: 'COMPLETED' } : apt
        ));
      });
      Alert.alert('Успех', 'Прием завершен');
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось завершить прием');
      throw error;
    }
  }, [updateIfMounted]);
  
  const markAsNoShow = useCallback(async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const updated = await appointmentApi.markAsNoShow(id);
      updateIfMounted(() => {
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updated } : apt));
      });
      Alert.alert('Успех', 'Клиент отмечен как неявившийся');
      return updated;
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось отметить неявку');
      throw error;
    }
  }, [updateIfMounted]);
  
  const addRecommendations = useCallback(async (
    id: number, 
    recommendationsData: AppointmentRecommendationsDto
  ): Promise<AppointmentResponseDto> => {
    try {
      const updated = await appointmentApi.addRecommendations(id, recommendationsData);
      updateIfMounted(() => {
        setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updated } : apt));
      });
      Alert.alert('Успех', 'Рекомендации добавлены');
      return updated;
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось добавить рекомендации');
      throw error;
    }
  }, [updateIfMounted]);
  
  // ============ ДЕЙСТВИЯ ДЛЯ ДЕТАЛЕЙ ============
  
  const updateAppointment = useCallback(async (data: AppointmentUpdateDto): Promise<AppointmentResponseDto> => {
    if (!appointmentId) throw new Error('Appointment ID is required');
    
    try {
      const updated = await appointmentApi.updateAppointment(appointmentId, data);
      updateIfMounted(() => setAppointment(updated));
      Alert.alert('Успех', 'Запись обновлена');
      return updated;
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось обновить запись');
      throw error;
    }
  }, [appointmentId, updateIfMounted]);
  
  // ============ ОЧИСТКА ПРИ РАЗМОНТИРОВАНИИ ============
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // ============ АВТОЗАГРУЗКА ============
  
  useEffect(() => {
    if (autoLoad) {
      switch (mode) {
        case 'owner':
          loadOwnerAppointments(0);
          break;
        case 'specialist':
          loadSpecialistAppointments();
          break;
        case 'details':
          loadAppointmentDetails();
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, appointmentId]);
  
  // ============ БАЗОВЫЙ РЕТУРН ============
  
  const baseReturn: UseAppointmentsReturn = {
    loading: loading || enriching,
    refreshing,
    error,
    refresh,
  };
  
  // ============ РЕТУРН ДЛЯ OWNER ============
  
  if (mode === 'owner') {
    return {
      ...baseReturn,
      appointments,
      hasMore,
      totalPages,
      currentPage,
      loadMore,
      cancelAppointment,
    };
  }
  
  // ============ РЕТУРН ДЛЯ SPECIALIST ============
  
  if (mode === 'specialist') {
    return {
      ...baseReturn,
      appointments,
      hasMore: false,
      totalPages,
      currentPage: 0,
      createdCount,
      confirmAppointment,
      cancelBySpecialist,
      completeAppointment,
      markAsNoShow,
      addRecommendations,
    };
  }
  
  // ============ РЕТУРН ДЛЯ DETAILS ============
  
  return {
    ...baseReturn,
    appointment,
    recommendations,
    updateAppointment,
  };
};

// ============ УДОБНЫЕ ОБЕРТКИ ============

export const useOwnerAppointments = (filters?: AppointmentFilters) => {
  return useAppointments({
    mode: 'owner',
    filters,
    autoLoad: true,
  });
};

export const useSpecialistAppointments = (filters?: AppointmentFilters) => {
  return useAppointments({
    mode: 'specialist',
    filters,
    autoLoad: true,
  });
};

export const useAppointmentDetails = (id: number) => {
  return useAppointments({
    mode: 'details',
    appointmentId: id,
    autoLoad: true,
  });
};

export default useAppointments;