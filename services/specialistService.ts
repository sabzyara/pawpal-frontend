import api from './api';
import type { SpecialistType } from '@/types/appointment.types';

interface VetResponseDto {
  vetId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  clinicName: string;
  experienceYears: number;
  avatarUrl: string;
  patientsCount: number;
  about: string;
  education: string;
  pricePerVisit: number;
  ratingAverage: number;
  reviewsCount: number;
  address: string;
  city: string;
}

interface ServiceProviderResponseDto {
  serviceId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  serviceCategory: string;
  experienceYears: number;
  education: string;
  avatarUrl: string;
  ratingAverage: number;
  reviewsCount: number;
  address: string;
  city: string;
  pricePerVisit: number;
  about: string;
  patientsCount: number;
}

export interface SpecialistInfo {
  specialistId: number;     
  specialistType: SpecialistType;
  userId: number;          
  vetId?: number;           
  serviceId?: number; 
  firstName: string;
  lastName: string;
  fullName: string;         
  avatarUrl?: string;
  pricePerVisit?: number;
  ratingAverage?: number;
}

class SpecialistService {
  private cache: Map<string, SpecialistInfo> = new Map();
  private currentSpecialistCache: SpecialistInfo | null = null;

  async getSpecialistByUserId(userId: number): Promise<SpecialistInfo> {
    const cacheKey = `userId_${userId}`;
    
    if (this.cache.has(cacheKey)) {
      console.log(` Cache hit for userId: ${userId}`);
      return this.cache.get(cacheKey)!;
    }

    console.log(`🔍 Fetching specialist for userId: ${userId}`);

    const vetInfo = await this.fetchVetByUserId(userId);
    if (vetInfo) {
      this.cache.set(cacheKey, vetInfo);
      this.cache.set(`vetId_${vetInfo.vetId!}`, vetInfo);
      return vetInfo;
    }

    const providerInfo = await this.fetchServiceProviderByUserId(userId);
    if (providerInfo) {
      this.cache.set(cacheKey, providerInfo);
      this.cache.set(`serviceId_${providerInfo.serviceId!}`, providerInfo);
      return providerInfo;
    }

    throw new Error(`No specialist found for userId: ${userId}`);
  }

  private async fetchVetByUserId(userId: number): Promise<SpecialistInfo | null> {
    try {
      const response = await api.get<VetResponseDto>(`/specialist-service/veterinarians/user/${userId}`);
      if (response.data?.vetId) {
        return this.mapVetToSpecialistInfo(response.data);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.warn(`Error fetching vet by userId ${userId}:`, error);
      }
    }
    return null;
  }

  private async fetchServiceProviderByUserId(userId: number): Promise<SpecialistInfo | null> {
    try {
      const response = await api.get<ServiceProviderResponseDto>(`/specialist-service/service-providers/user/${userId}`);
      if (response.data?.serviceId) {
        return this.mapServiceProviderToSpecialistInfo(response.data);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.warn(`Error fetching service provider by userId ${userId}:`, error);
      }
    }
    return null;
  }

  private mapVetToSpecialistInfo(data: VetResponseDto): SpecialistInfo {
    return {
      specialistId: data.userId,
      specialistType: 'VET',
      userId: data.userId,
      vetId: data.vetId,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      avatarUrl: data.avatarUrl,
      pricePerVisit: data.pricePerVisit,
      ratingAverage: data.ratingAverage
    };
  }

  private mapServiceProviderToSpecialistInfo(data: ServiceProviderResponseDto): SpecialistInfo {
    return {
      specialistId: data.userId,
      specialistType: 'SERVICE',
      userId: data.userId,
      serviceId: data.serviceId,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      avatarUrl: data.avatarUrl,
      pricePerVisit: data.pricePerVisit,
      ratingAverage: data.ratingAverage
    };
  }

  async getSpecialistByVetId(vetId: number): Promise<SpecialistInfo | null> {
    const cacheKey = `vetId_${vetId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await api.get<VetResponseDto>(`/specialist-service/veterinarians/profile/${vetId}`);
      if (response.data) {
        const info = this.mapVetToSpecialistInfo(response.data);
        this.cache.set(cacheKey, info);
        this.cache.set(`userId_${response.data.userId}`, info);
        return info;
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.warn(`Error fetching vet by vetId ${vetId}:`, error);
      }
    }
    return null;
  }

  async getSpecialistByServiceProviderId(serviceProviderId: number): Promise<SpecialistInfo | null> {
    const cacheKey = `serviceProviderId_${serviceProviderId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await api.get<ServiceProviderResponseDto>(`/specialist-service/service-providers/${serviceProviderId}`);
      if (response.data) {
        const info = this.mapServiceProviderToSpecialistInfo(response.data);
        this.cache.set(cacheKey, info);
        this.cache.set(`userId_${response.data.userId}`, info);
        return info;
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.warn(`Error fetching service provider by id ${serviceProviderId}:`, error);
      }
    }
    return null;
  }

  async getSpecialistBySpecialistId(
    specialistId: number, 
    specialistType: SpecialistType
  ): Promise<SpecialistInfo | null> {
    return this.getSpecialistByUserId(specialistId);
  }

  async getCurrentSpecialist(): Promise<SpecialistInfo | null> {
    if (this.currentSpecialistCache) {
      return this.currentSpecialistCache;
    }

    try {
      const response = await api.get<VetResponseDto>('/specialist-service/veterinarians/me');
      if (response.data?.vetId) {
        const info = this.mapVetToSpecialistInfo(response.data);
        this.currentSpecialistCache = info;
        this.cache.set(`userId_${response.data.userId}`, info);
        this.cache.set(`vetId_${response.data.vetId}`, info);
        return info;
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.warn('Error fetching current vet profile:', error);
      }
    }

    try {
      const response = await api.get<ServiceProviderResponseDto>('/specialist-service/service-providers/me');
      if (response.data?.serviceId) {
        const info = this.mapServiceProviderToSpecialistInfo(response.data);
        this.currentSpecialistCache = info;
        this.cache.set(`userId_${response.data.userId}`, info);
        this.cache.set(`serviceId_${response.data.serviceId}`, info);
        return info;
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.warn('Error fetching current service provider profile:', error);
      }
    }

    return null;
  }

  async isCurrentUserSpecialist(): Promise<boolean> {
    const specialist = await this.getCurrentSpecialist();
    return specialist !== null;
  }

  async getCurrentSpecialistType(): Promise<SpecialistType | null> {
    const specialist = await this.getCurrentSpecialist();
    return specialist?.specialistType || null;
  }

  async getCurrentSpecialistId(): Promise<number | null> {
    const specialist = await this.getCurrentSpecialist();
    return specialist?.specialistId || null;
  }

  async getSpecialistForAppointmentService(userId: number): Promise<{
    specialistId: number;
    specialistType: SpecialistType;
  }> {
    const specialist = await this.getSpecialistByUserId(userId);
    return {
      specialistId: specialist.userId,
      specialistType: specialist.specialistType,
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.currentSpecialistCache = null;
    console.log('Specialist cache cleared');
  }

  async refreshSpecialist(userId: number): Promise<SpecialistInfo> {
    const keysToDelete: string[] = [];
    for (const [key, value] of this.cache.entries()) {
      if (value.userId === userId) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (this.currentSpecialistCache?.userId === userId) {
      this.currentSpecialistCache = null;
    }
    
    console.log(`Refreshing specialist data for userId: ${userId}`);
    return this.getSpecialistByUserId(userId);
  }
}

export const specialistService = new SpecialistService();