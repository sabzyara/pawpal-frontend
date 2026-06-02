import api from './api'; 
import type { 
  AppointmentResponseDto, 
  AppointmentCreateDto, 
  AppointmentUpdateDto,
  AppointmentCancelDto,
  AppointmentRejectDto,
  AppointmentRescheduleDto,
  AppointmentRecommendationsDto,
  AppointmentFilters,
  Page,
  TimeSlot,
  SpecialistScheduleCreateDto,
  SpecialistScheduleResponse,
  SpecialistType,
  AppointmentStatus,
  TimeSlotStatus
} from '@/types/appointment.types';

// Реэкспортируем типы
export type {
  AppointmentResponseDto,
  AppointmentCreateDto,
  AppointmentUpdateDto,
  AppointmentCancelDto,
  AppointmentRejectDto,
  AppointmentRescheduleDto,
  AppointmentRecommendationsDto,
  AppointmentFilters,
  Page,
  TimeSlot,
  SpecialistScheduleCreateDto,
  SpecialistScheduleResponse,
  SpecialistType,
  AppointmentStatus,
  TimeSlotStatus
};

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

// ============ КОНСТАНТЫ ============

const APPOINTMENTS_URL = '/appointment-service/appointments';
const SCHEDULES_URL = '/appointment-service/schedules';
const SLOTS_URL = '/appointment-service/slots';

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

// Обработка ошибок axios
const handleAxiosError = (error: any): never => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || 'Request failed';
  
  if (status === 401) {
    throw new AuthError(message);
  } else if (status === 400) {
    throw new ValidationError(message);
  } else if (status >= 500) {
    throw new NetworkError(message);
  }
  
  throw new Error(message);
};

// ============ APPOINTMENT API ============

export const appointmentApi = {
  createAppointment: async (data: AppointmentCreateDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.post<AppointmentResponseDto>(APPOINTMENTS_URL, data);
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
        sort: filters?.sort,
      };
      
      const response = await api.get<Page<AppointmentResponseDto>>(`${APPOINTMENTS_URL}/me`, { params });
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
      };
      
      const response = await api.get<Page<AppointmentResponseDto>>(`${APPOINTMENTS_URL}/specialist/me`, { params });
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
      const response = await api.get<Page<AppointmentResponseDto>>(`${APPOINTMENTS_URL}/upcoming`, { params });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getAppointmentById: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.get<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  updateAppointment: async (id: number, data: AppointmentUpdateDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.put<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}`, data);
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
      
      await api.delete<void>(url);
    } catch (error) {
      throw handleAxiosError(error);
    }
    
  },
  
  confirmAppointment: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.patch<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  completeAppointment: async (id: number): Promise<void> => {
    try {
      await api.patch<void>(`${APPOINTMENTS_URL}/${id}/complete`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  markAsNoShow: async (id: number): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.patch<AppointmentResponseDto>(`${APPOINTMENTS_URL}/${id}/no-show`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  addRecommendations: async (id: number, recommendations: AppointmentRecommendationsDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.post<AppointmentResponseDto>(
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
      const response = await api.get<string>(`${APPOINTMENTS_URL}/${id}/recommendations`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get recommendations:', error);
      return null;
    }
  },

  rescheduleAppointment: async (data: AppointmentRescheduleDto): Promise<AppointmentResponseDto> => {
    try {
      const response = await api.post<AppointmentResponseDto>(`${APPOINTMENTS_URL}/reschedule`, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  
};

// ============ TIME SLOT API ============

export const timeSlotApi = {
  getAvailableSlotsForDate: async (
  specialistId: number,
  specialistType: SpecialistType,
  date: string,
  page: number = 0,
  size: number = 50
): Promise<{ content: TimeSlot[]; totalPages: number; totalElements: number }> => {
  try {
    const params = { specialistId, specialistType, date, page, size };
    const response = await api.get<Page<TimeSlot>>(`${SLOTS_URL}/available`, { params });
    return {
      content: response.data.content || [],
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements
    };
  } catch (error) {
    throw handleAxiosError(error);
  }
},

  blockSlot: async (slotId: number, reason: string): Promise<TimeSlot> => {
    try {
      const response = await api.post<TimeSlot>(`${SLOTS_URL}/${slotId}/block`, null, {
        params: { reason }
      });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  unblockSlot: async (slotId: number): Promise<TimeSlot> => {
    try {
      const response = await api.post<TimeSlot>(`${SLOTS_URL}/${slotId}/unblock`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  regenerateSlotsForDate: async (specialistId: number, date: string): Promise<void> => {
    try {
      await api.post<void>(`${SLOTS_URL}/regenerate`, null, {
        params: { specialistId, date }
      });
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};

// ============ SCHEDULE API ============

// services/appointmentApi.ts - добавить в scheduleApi

export const scheduleApi = {
  createSchedule: async (data: SpecialistScheduleCreateDto): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await api.post<SpecialistScheduleResponse>(SCHEDULES_URL, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getMySchedules: async (): Promise<SpecialistScheduleResponse[]> => {
    try {
      const response = await api.get<SpecialistScheduleResponse[]>(`${SCHEDULES_URL}/me`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getSchedulesBySpecialist: async (specialistId: number): Promise<SpecialistScheduleResponse[]> => {
    try {
      const response = await api.get<SpecialistScheduleResponse[]>(`${SCHEDULES_URL}/specialist/${specialistId}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getScheduleById: async (id: number): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await api.get<SpecialistScheduleResponse>(`${SCHEDULES_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  getScheduleByDay: async (dayOfWeek: string): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await api.get<SpecialistScheduleResponse>(`${SCHEDULES_URL}/day/${dayOfWeek}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  updateSchedule: async (id: number, data: Partial<SpecialistScheduleCreateDto>): Promise<SpecialistScheduleResponse> => {
    try {
      const response = await api.put<SpecialistScheduleResponse>(`${SCHEDULES_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  deleteSchedule: async (id: number): Promise<void> => {
    try {
      await api.delete<void>(`${SCHEDULES_URL}/${id}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },

  deleteScheduleByDay: async (dayOfWeek: string): Promise<void> => {
    try {
      await api.delete<void>(`${SCHEDULES_URL}/day/${dayOfWeek}`);
    } catch (error) {
      throw handleAxiosError(error);
    }
  },
};
// ============ DEFAULT EXPORT ============

export default appointmentApi;