export enum Role {
  OWNER = "OWNER",
  VET = "VET",
  SERVICE = "SERVICE",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
}

// Базовый пользователь
export interface User {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

// Владелец питомца
export interface PetOwner {
  id: number;
  userId: number;
  username: string;
  phoneNumber: string;
  address: string;
  avatarUrl?: string;
}

// Ветеринар
export interface Veterinarian {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  clinicName?: string;
  experienceYears: number;
  avatarUrl?: string;
  rating: number;
  patientsCount: number;
  about?: string;
}

// Сервис-провайдер
export interface ServiceProvider {
  serviceProviderId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  serviceCategory: string;
  avatarUrl?: string;
}

// Полный профиль пользователя
export interface UserProfile {
  user: User;
  petOwner?: PetOwner;
  veterinarian?: Veterinarian;
  serviceProvider?: ServiceProvider;
}
