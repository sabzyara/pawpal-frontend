export enum Role {
  OWNER = "OWNER",
  VET = "VET",
  SERVICE = "SERVICE",
  ADMIN = "ADMIN"
}

export interface RegisterData {
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
  username?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  clinicName?: string;
  experienceYears?: number;
  serviceCategory?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: Role;
    status: string;
  };
}