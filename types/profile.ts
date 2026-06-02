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

export interface Veterinarian {
  vetId: number;                    
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;             
  licenseNumber?: string;           
  clinicName?: string;
  experienceYears?: number;         
  avatarUrl?: string;
  patientsCount?: number;           
  about?: string;
  education?: string;
  pricePerVisit?: number;
  ratingAverage?: number;           
  reviewsCount?: number;            
  address?: string;                 
  city?: string;                    
}

// Сервис-провайдер
export interface ServiceProvider {
  serviceProviderId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  serviceCategory?: string;         
  experienceYears?: number;         
  education?: string;
  avatarUrl?: string;
  ratingAverage?: number;           
  reviewsCount?: number;            
  address?: string;                 
  city?: string;                    
  pricePerVisit?: number;
  about?: string;                   
  patientsCount?: number;           
}

// Полный профиль пользователя
export interface UserProfile {
  user: User;
  petOwner?: PetOwner;
  veterinarian?: Veterinarian;
  serviceProvider?: ServiceProvider;
}
