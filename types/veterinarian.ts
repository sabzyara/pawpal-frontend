export interface Veterinarian {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  clinicName?: string;
  experienceYears: number;
  rating: number;
  patientsCount: number;
  about?: string;
  specialties?: string[];
  certifications?: string[];
  education?: string;
  languages?: string[];
  pricePerVisit?: number;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Availability {
  monday: { start: string; end: string }[];
  tuesday: { start: string; end: string }[];
  wednesday: { start: string; end: string }[];
  thursday: { start: string; end: string }[];
  friday: { start: string; end: string }[];
  saturday: { start: string; end: string }[];
  sunday: { start: string; end: string }[];
}   