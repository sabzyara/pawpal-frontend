// services/appointmentApi.ts
  import { appointmentApiClient  } from './api';
import { specialistService, type SpecialistInfo } from './specialistService';
import type { 
  AppointmentResponseDto, 
  AppointmentCreateDto, 
  AppointmentUpdateDto,
  AppointmentCancelDto,
  AppointmentRescheduleDto,
  AppointmentRecommendationsDto,
  AppointmentFilters,
  Page,
  TimeSlot,
  SpecialistScheduleCreateDto,
  SpecialistScheduleResponse,
  SpecialistType,
  AppointmentStatus,
  SlotStatus  
} from '@/types/appointment.types';

export type {
  AppointmentResponseDto,
  AppointmentCreateDto,
  AppointmentUpdateDto,
  AppointmentCancelDto,
  AppointmentRescheduleDto,
  AppointmentRecommendationsDto,
  AppointmentFilters,
  Page,
  TimeSlot,
  SpecialistScheduleCreateDto,
  SpecialistScheduleResponse,
  SpecialistType,
  AppointmentStatus,
  SlotStatus  
};

export type { SpecialistInfo } from './specialistService';

// ============ КАСТОМНЫЕ ОШИБКИ ============

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// ============ КОНСТАНТЫ ============

const APPOINTMENTS_URL = '/appointments';
const SCHEDULES_URL = '/schedules';
const SLOTS_URL = '/slots';

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const handleAxiosError = (error: any): never => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || 'Request failed';
  
  if (status === 401) {
    throw new AuthError(message);
  } else if (status === 403) {
    throw new AuthError('Access denied');
  } else if (status === 400) {
    throw new ValidationError(message);
  } else if (status === 409) {
    throw new ConflictError(message);
  } else if (status && status >= 500) {
    throw new NetworkError(message);
  }
  
  throw new Error(message);
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============ APPOINTMENT API ============

export const appointmentApi = {
  createAppointment: async (data: AppointmentCreateDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.post<AppointmentResponseDto>(APPOINTMENTS_URL, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getMyAppointments: async (filters?: AppointmentFilters): Promise<Page<AppointmentResponseDto>> => {
    try {
      const params: Record<string, any> = {
        status: filters?.status,
        page: filters?.page,
        size: filters?.size || 10,
        sort: filters?.sort || 'date,desc', 
      };
      
      const response = await appointmentApiClient.get<Page<AppointmentResponseDto>>(`${APPOINTMENTS_URL}/me`, { params });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getSpecialistAppointments: async (filters?: AppointmentFilters): Promise<Page<AppointmentResponseDto>> => {
    try {
      const params: Record<string, any> = {
        status: filters?.status,
        page: filters?.page,
        size: filters?.size || 10,
        sort: filters?.sort || 'date,desc',
      };
      
      const response = await appointmentApiClient.get<Page<AppointmentResponseDto>>(`${APPOINTMENTS_URL}/specialist/me`, { params });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getUpcomingAppointments: async (
    userType: 'owner' | 'specialist', 
    page?: number,
    size?: number
  ): Promise<Page<AppointmentResponseDto>> => {
    try {
      const params = { userType, page, size: size || 10 };
      const response = await appointmentApiClient.get<Page<AppointmentResponseDto>>(`${APPOINTMENTS_URL}/upcoming`, { params });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getAppointmentById: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.get<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  updateAppointment: async (id: number, data: AppointmentUpdateDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.put<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  cancelAppointment: async (id: number, reason?: string): Promise<void> => {
    try {
      const url = reason 
        ? `${APPOINTMENTS_URL}/${id}?reason=${encodeURIComponent(reason)}`
        : `${APPOINTMENTS_URL}/${id}`;
      
      await appointmentApiClient.delete<void>(url);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  
  cancelAppointmentWithBody: async (id: number, cancelDto: AppointmentCancelDto): Promise<void> => {
    try {
      await appointmentApiClient.post<void>(`${APPOINTMENTS_URL}/${id}/cancel`, cancelDto);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
  
  confirmAppointment: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.patch<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  completeAppointment: async (id: number): Promise<void> => {
    try {
      await appointmentApiClient.patch<void>(`${APPOINTMENTS_URL}/${id}/complete`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  markAsNoShow: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.patch<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}/no-show`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  addRecommendations: async (id: number, recommendations: AppointmentRecommendationsDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.post<AppointmentResponseDto>(
        `${APPOINTMENTS_URL}/${id}/recommendations`,
        recommendations
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getRecommendations: async (id: number): Promise<string | null> => {
  try {
    const response = await appointmentApiClient.get<string>(`${APPOINTMENTS_URL}/${id}/recommendations`);
    return response.data;
  } catch (error: any) {
    // ✅ 400 означает, что рекомендации еще не добавлены (статус не COMPLETED)
    if (error?.response?.status === 400 || error?.response?.status === 404) {
      console.log(`ℹ️ No recommendations yet for appointment ${id}`);
      return null;
    }
    console.warn('Failed to get recommendations:', error);
    return null;
  }
},

  rescheduleAppointment: async (data: AppointmentRescheduleDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await appointmentApiClient.post<AppointmentResponseDto>(`${APPOINTMENTS_URL}/reschedule`, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};

// ============ TIME SLOT API ============

export const timeSlotApi = {
  getAvailableSlotsBySpecialistId: async (
    specialistId: number,
    specialistType: SpecialistType,
    date: string,
    page: number = 0,
    size: number = 20
  ): Promise<Page<TimeSlot>> => {  
    try {
      console.log('📤 GET AVAILABLE SLOTS - URL:', `${SLOTS_URL}/available`);
      console.log('📤 GET AVAILABLE SLOTS - Params:', { specialistId, specialistType, date, page, size });
      
      const response = await appointmentApiClient.get<Page<TimeSlot>>(`${SLOTS_URL}/available`, {
        params: { specialistId, specialistType, date, page, size }
      });
      
      console.log(' GET AVAILABLE SLOTS - Count:', response.data?.content?.length);
      return response.data;
    } catch (error) {
      console.error(' GET AVAILABLE SLOTS - Error:', error);
      throw handleAxiosError(error);
    }
  },

  getSlotsByDate: async (
    specialistId: number,
    specialistType: SpecialistType,
    date: string
  ): Promise<TimeSlot[]> => {
    try {
      console.log('📤 GET SLOTS BY DATE - URL:', `${SLOTS_URL}/date`);
      console.log('📤 GET SLOTS BY DATE - Params:', { specialistId, specialistType, date });
      
      const response = await appointmentApiClient.get<TimeSlot[]>(`${SLOTS_URL}/date`, {
        params: { specialistId, specialistType, date }
      });
      
      console.log(' GET SLOTS BY DATE - Count:', response.data?.length);
      return response.data || [];
    } catch (error) {
      console.error(' GET SLOTS BY DATE - Error:', error);
      throw handleAxiosError(error);
    }
  },

  getMyAvailableSlots: async (
    date: string,
    page: number = 0,
    size: number = 20
  ): Promise<Page<TimeSlot>> => { 
    try {
      console.log('📤 GET MY AVAILABLE SLOTS - URL:', `${SLOTS_URL}/my-available`);
      console.log('📤 GET MY AVAILABLE SLOTS - Params:', { date, page, size });
      
      const response = await appointmentApiClient.get<Page<TimeSlot>>(`${SLOTS_URL}/my-available`, {
        params: { date, page, size }
      });
      
      console.log(' GET MY AVAILABLE SLOTS - Count:', response.data?.content?.length);
      return response.data;
    } catch (error) {
      console.error(' GET MY AVAILABLE SLOTS - Error:', error);
      throw handleAxiosError(error);
    }
  },

  getAvailableSlotsByUserId: async (
    userId: number,
    date: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ slots: Page<TimeSlot>; specialistInfo: SpecialistInfo }> => {  
    try {
      const specialist = await specialistService.getSpecialistByUserId(userId);
      
      console.log('📤 GET AVAILABLE SLOTS BY USER - Specialist:', {
        specialistId: specialist.specialistId,
        specialistType: specialist.specialistType
      });
      
      const slots = await timeSlotApi.getAvailableSlotsBySpecialistId(
        specialist.specialistId,
        specialist.specialistType,
        date,
        page,
        size
      );
      
      return {
        slots,
        specialistInfo: specialist
      };
    } catch (error) {
      console.error(' GET AVAILABLE SLOTS BY USER - Error:', error);
      throw handleAxiosError(error);
    }
  },

  blockSlot: async (slotId: number, reason: string): Promise<TimeSlot> => {
    try {
      console.log('📤 BLOCK SLOT - URL:', `${SLOTS_URL}/${slotId}/block`);
      
      const response = await appointmentApiClient.post<TimeSlot>(
        `${SLOTS_URL}/${slotId}/block`,
        null,
        { params: { reason } }
      );
      
      console.log(' BLOCK SLOT - Success');
      return response.data;
    } catch (error) {
      console.error(' BLOCK SLOT - Error:', error);
      throw handleAxiosError(error);
    }
  },

  unblockSlot: async (slotId: number): Promise<TimeSlot> => {
    try {
      console.log('📤 UNBLOCK SLOT - URL:', `${SLOTS_URL}/${slotId}/unblock`);
      
      const response = await appointmentApiClient.post<TimeSlot>(`${SLOTS_URL}/${slotId}/unblock`);
      
      console.log(' UNBLOCK SLOT - Success');
      return response.data;
    } catch (error) {
      console.error(' UNBLOCK SLOT - Error:', error);
      throw handleAxiosError(error);
    }
  },

  regenerateSlots: async (
    specialistId: number,
    date: string
  ): Promise<void> => {
    try {
      console.log(' REGENERATE SLOTS - URL:', `${SLOTS_URL}/regenerate`);
      
      const response = await appointmentApiClient.post<void>(
        `${SLOTS_URL}/regenerate`,
        null,
        { params: { specialistId, date } }
      );
      
      console.log(' REGENERATE SLOTS - Success');
    } catch (error) {
      console.error(' REGENERATE SLOTS - Error:', error);
      throw handleAxiosError(error);
    }
  },

  regenerateAllSlots: async (specialistId: number): Promise<void> => {  
    try {
      console.log(' REGENERATE ALL SLOTS - URL:', `${SLOTS_URL}/regenerate-all`);
      
      await appointmentApiClient.post<void>(
        `${SLOTS_URL}/regenerate-all`,
        null,
        { params: { specialistId } }
      );
      
      console.log(' REGENERATE ALL SLOTS - Success');
    } catch (error) {
      console.error(' REGENERATE ALL SLOTS - Error:', error);
      throw handleAxiosError(error);
    }
  },

  regenerateSlotsByUserId: async (userId: number, date: string): Promise<void> => {
    try {
      const specialist = await specialistService.getSpecialistByUserId(userId);
      await timeSlotApi.regenerateSlots(specialist.specialistId, date);
    } catch (error) {
      console.error('❌ REGENERATE SLOTS BY USER - Error:', error);
      throw handleAxiosError(error);
    }
  },
};

// ============ SCHEDULE API ============

export const scheduleApi = {
  createSchedule: async (data: SpecialistScheduleCreateDto, retryCount: number = 0): Promise<SpecialistScheduleResponse> => {
    try {
      console.log('📤 CREATE SCHEDULE - URL:', SCHEDULES_URL);
      console.log('📤 CREATE SCHEDULE - Data:', JSON.stringify(data, null, 2));
      
      const response = await appointmentApiClient.post<SpecialistScheduleResponse>(SCHEDULES_URL, data);
      console.log('✅ CREATE SCHEDULE - Response:', response.status);
      return response.data;
    } catch (error: any) {
      if (retryCount < 3 && (
        error?.message === 'Network Error' ||
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.response?.status === 504
      )) {
        console.log(`🔄 Server waking up, retry ${retryCount + 1}/3...`);
        await sleep(2000);
        return scheduleApi.createSchedule(data, retryCount + 1);
      }
      throw handleAxiosError(error);
    }
  },

  createWeeklySchedules: async (
    specialistId: number,
    specialistType: SpecialistType,
    schedules: SpecialistScheduleCreateDto[]
  ): Promise<SpecialistScheduleResponse[]> => {
    try {
      console.log('📤 CREATE WEEKLY SCHEDULES - URL:', `${SCHEDULES_URL}/weekly`);
      
      const response = await appointmentApiClient.post<SpecialistScheduleResponse[]>(
        `${SCHEDULES_URL}/weekly`,
        schedules,
        { params: { specialistId, specialistType } }
      );
      
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getMySchedules: async (retryCount: number = 0): Promise<SpecialistScheduleResponse[]> => {
    try {
      console.log('📤 GET MY SCHEDULES - URL:', `${SCHEDULES_URL}/me`);
      const response = await appointmentApiClient.get<SpecialistScheduleResponse[]>(`${SCHEDULES_URL}/me`);
      console.log('✅ GET MY SCHEDULES - Count:', response.data?.length);
      return response.data;
    } catch (error: any) {
      if (retryCount < 3 && (
        error?.message === 'Network Error' ||
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.response?.status === 504
      )) {
        console.log(`🔄 Server waking up, retry ${retryCount + 1}/3...`);
        await sleep(2000);
        return scheduleApi.getMySchedules(retryCount + 1);
      }
      throw handleAxiosError(error);
    }
  },

  getSchedulesBySpecialistId: async (specialistId: number): Promise<SpecialistScheduleResponse[]> => {
    try {
      console.log('📤 GET SCHEDULES BY SPECIALIST ID:', `${SCHEDULES_URL}/specialist/${specialistId}`);
      const response = await appointmentApiClient.get<SpecialistScheduleResponse[]>(`${SCHEDULES_URL}/specialist/${specialistId}`);
      return response.data;
    } catch (error: any) {
      // ✅ Специальная обработка для 403 ошибки
      if (error?.response?.status === 403) {
        console.warn('⚠️ Access denied to schedules, returning empty array');
        // Возвращаем пустой массив вместо ошибки
        return [];
      }
      throw handleAxiosError(error);
    }
  },

  // ✅ ИСПРАВЛЕННЫЙ МЕТОД с обработкой 403
  getSchedulesByUserId: async (userId: number): Promise<{
    schedules: SpecialistScheduleResponse[];
    specialistInfo: SpecialistInfo;
  }> => {
    try {
      const specialist = await specialistService.getSpecialistByUserId(userId);
      let schedules: SpecialistScheduleResponse[] = [];
      
      try {
        schedules = await scheduleApi.getSchedulesBySpecialistId(specialist.specialistId);
      } catch (error: any) {
        if (error?.response?.status === 403) {
          console.warn('⚠️ Access denied to schedules for specialist:', specialist.specialistId);
          schedules = [];
        } else {
          throw error;
        }
      }
      
      return {
        schedules,
        specialistInfo: specialist
      };
    } catch (error) {
      console.error('❌ Error in getSchedulesByUserId:', error);
      throw handleAxiosError(error);
    }
  },

  getScheduleById: async (id: number): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await appointmentApiClient.get<SpecialistScheduleResponse>(`${SCHEDULES_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getScheduleByDay: async (dayOfWeek: string): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await appointmentApiClient.get<SpecialistScheduleResponse>(`${SCHEDULES_URL}/day/${dayOfWeek}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  updateSchedule: async (id: number, data: Partial<SpecialistScheduleCreateDto>): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await appointmentApiClient.put<SpecialistScheduleResponse>(`${SCHEDULES_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  deleteSchedule: async (id: number): Promise<void> => {
    try {
      await appointmentApiClient.delete<void>(`${SCHEDULES_URL}/${id}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  deleteScheduleByDay: async (dayOfWeek: string): Promise<void> => {
    try {
      await appointmentApiClient.delete<void>(`${SCHEDULES_URL}/day/${dayOfWeek}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};

export { specialistService } from './specialistService';

// ============ DEFAULT EXPORT ============

export default appointmentApi;