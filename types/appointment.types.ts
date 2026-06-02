// types/appointment.types.ts

export type SpecialistType = 'VET' | 'SERVICE';
export type UserRole = 'OWNER' | 'SPECIALIST' | 'ADMIN';
export type AppointmentStatus = 
  | 'CREATED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED_BY_USER'
  | 'CANCELLED_BY_SPECIALIST'
  | 'NO_SHOW';
export type TimeSlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface AppointmentResponseDto {
  id: number;
  specialistId: number;
  specialistName: string;
  specialistType: SpecialistType;
  specialistAvatar?: string;
  petOwnerId: number;
  petOwnerName: string;
  petOwnerPhone?: string;
  petId: number;
  petName: string;
  petType: string;
  petBreed?: string;
  timeSlotId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  ownerNotes?: string;
  specialistNotes?: string;
  recommendations?: string;
  cancellationReason?: string;
  cancelledBy?: UserRole;
  confirmedBy?: UserRole;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentCreateDto {
  specialistId: number;
  specialistType: SpecialistType;
  petOwnerId: number;
  petId: number;
  timeSlotId: number;
  ownerNotes?: string;
}

export interface AppointmentUpdateDto {
  ownerNotes?: string;
  specialistNotes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentCancelDto {
  userId: number;
  cancellationReason: string;
}

export interface AppointmentRejectDto {
  reason: string;
}

export interface AppointmentRescheduleDto {
  appointmentId: number;
  newTimeSlotId: number;
  reason?: string;
}

export interface AppointmentRecommendationsDto {
  recommendations: string;
  specialistNotes?: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  specialistId?: number;
  petId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface TimeSlot {
  id: number;
  specialistId: number;
  specialistType: SpecialistType; // Исправлено: теперь не string, а SpecialistType
  date: string;
  startTime: string;
  endTime: string;
  status: TimeSlotStatus; // Исправлено: теперь не string, а TimeSlotStatus
  available: boolean;
}

export interface SpecialistScheduleCreateDto {
  specialistId: number;
  specialistType: SpecialistType;
  dayOfWeek: string;
  workStart: string;
  workEnd: string;
  breakStart: string | null;
  breakEnd: string | null;
  slotDurationMinutes: number;
}

export interface SpecialistScheduleResponse {
  id: number;
  specialistId: number;
  specialistType: SpecialistType;
  dayOfWeek: string;
  workStart: string;
  workEnd: string;
  breakStart: string | null;
  breakEnd: string | null;
  slotDurationMinutes: number;
}