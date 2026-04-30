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
}