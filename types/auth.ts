export enum Role {
  OWNER = "OWNER",
  VET = "VET",
  SERVICE = "SERVICE",
  ADMIN = "ADMIN"
}

export interface RegisterData {
  email: string;
  password: string;
  role: Role;
}

export interface CompleteProfileData {
  username: string;
  phoneNumber: string;
  address?: string;
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