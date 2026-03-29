export enum Role {
  OWNER = "OWNER",
  VET = "VET",
  SERVICE = "SERVICE",
  ADMIN = "ADMIN"
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED"
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
}

// Ветеринар
export interface Veterinarian {
  vetId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  clinicName: string;
  experienceYears: number;
}

// Сервис-провайдер
export interface ServiceProvider {
  serviceProviderId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  serviceCategory: string;
}

// Полный профиль пользователя
export interface UserProfile {
  user: User;
  petOwner?: PetOwner;
  veterinarian?: Veterinarian;
  serviceProvider?: ServiceProvider;
}