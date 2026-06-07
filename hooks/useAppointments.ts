import api from "@/services/api";
import { appointmentApi, specialistService } from "@/services/appointmentApi";
import type { SpecialistInfo } from "@/services/appointmentApi";
import {
  AppointmentFilters,
  AppointmentRecommendationsDto,
  AppointmentResponseDto,
  AppointmentUpdateDto,
  SpecialistType,
} from "@/types/appointment.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";



export type UseAppointmentsMode = "owner" | "specialist" | "details";

export interface EnrichedAppointment {
  id: number;
  petId: number;
  petOwnerId: number;
  specialistId: number;
  specialistType: SpecialistType;
  timeSlotId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  ownerNotes?: string;
  specialistNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  specialistName: string;
  specialistInfo?: SpecialistInfo;
  petOwnerName: string;
  petName: string;
  petType: string;
  petBreed?: string;
}

export interface UseAppointmentsConfig {
  mode: UseAppointmentsMode;
  appointmentId?: number;
  filters?: AppointmentFilters;
  autoLoad?: boolean;
  pageSize?: number;
  clearCacheOnUnmount?: boolean;
}

export interface UseAppointmentsReturn {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
  appointments?: EnrichedAppointment[];
  hasMore?: boolean;
  totalPages?: number;
  currentPage?: number;
  loadMore?: () => void;
  cancelAppointment?: (id: number, reason: string) => Promise<boolean>;
  createdCount?: number;
  specialistInfo?: SpecialistInfo | null;
  confirmAppointment?: (id: number) => Promise<AppointmentResponseDto>;
  cancelBySpecialist?: (id: number, reason: string) => Promise<void>;
  completeAppointment?: (id: number) => Promise<void>;
  markAsNoShow?: (id: number) => Promise<AppointmentResponseDto>;
  addRecommendations?: (
    id: number,
    recommendations: AppointmentRecommendationsDto,
  ) => Promise<AppointmentResponseDto>;
  appointment?: EnrichedAppointment | null;
  recommendations?: string | null;
  updateAppointment?: (
    data: AppointmentUpdateDto,
  ) => Promise<AppointmentResponseDto>;
}


interface UserData {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PetData {
  name: string;
  species: string;
  breed?: string;
}

const userCache = new Map<number, UserData>();
const petCache = new Map<number, PetData>();
const specialistInfoCache = new Map<string, SpecialistInfo>();

let activeHooksCount = 0;


const getSpecialistInfo = async (
  specialistId: number,
  specialistType: string
): Promise<{ name: string; info?: SpecialistInfo }> => {
  const cacheKey = `${specialistType}_${specialistId}`;
  
  if (specialistInfoCache.has(cacheKey)) {
    const info = specialistInfoCache.get(cacheKey)!;
    return { name: `${info.firstName} ${info.lastName}`.trim(), info };
  }

  try {
    const info = await specialistService.getSpecialistByUserId(specialistId);
    if (info) {
      specialistInfoCache.set(cacheKey, info);
      return { name: `${info.firstName} ${info.lastName}`.trim(), info };
    }
  } catch (error) {
    console.error("Failed to load specialist info:", error);
  }

  return { name: `Специалист #${specialistId}` };
};

const enrichSingleAppointment = async (appointment: any): Promise<EnrichedAppointment | null> => {
  if (!appointment) return null;

  let specialistName = "";
  let specialistInfo = null;

  if (appointment.specialistId && appointment.specialistType) {
    const result = await getSpecialistInfo(
      appointment.specialistId,
      appointment.specialistType
    );
    specialistName = result.name;
    specialistInfo = result.info;
  } else {
    specialistName = `Специалист #${appointment.specialistId || "?"}`;
  }

  let petOwnerName = "";
  const ownerId = appointment.petOwnerId || appointment.userId;
  if (ownerId) {
    if (userCache.has(ownerId)) {
      const user = userCache.get(ownerId)!;
      petOwnerName = `${user.firstName} ${user.lastName}`.trim();
    } else {
      try {
        const response = await api.get(`/user-service/users/${ownerId}`);
        const user = response.data;
        const userData = {
          firstName: user.firstName || user.first_name || "",
          lastName: user.lastName || user.last_name || "",
          phone: user.phone || user.phoneNumber,
        };
        userCache.set(ownerId, userData);
        petOwnerName = `${userData.firstName} ${userData.lastName}`.trim();
      } catch (error) {
        console.error("Failed to load owner:", error);
        petOwnerName = `Владелец #${ownerId}`;
      }
    }
  }

  let petName = "";
  let petType = "";
  let petBreed = "";

  if (appointment.petId) {
  if (petCache.has(appointment.petId)) {
    const pet = petCache.get(appointment.petId)!;
    petName = pet.name;
    petType = pet.species;
    petBreed = pet.breed || "";
  } else {
    try {
      const response = await api.get(`/pet-management/api/pets/pet/${appointment.petId}/full`);
      const pet = response.data;
      

      console.log(`🐾 Pet ${appointment.petId} data:`, JSON.stringify(pet, null, 2));
      

      const petData = {
        name: pet.petName || pet.name || "Unknown",
        species: pet.petType || pet.species || pet.type || "Unknown",
        breed: pet.breed || "",
      };
      
      petCache.set(appointment.petId, petData);
      petName = petData.name;
      petType = petData.species;
      petBreed = petData.breed;
    } catch (error) {
      console.error(`Failed to load pet ${appointment.petId}:`, error);

      petName = "Питомец";
      petType = "Не указан";
      petBreed = "";
    }
  }
}

  return {
    ...appointment,
    specialistName,
    specialistInfo,
    petOwnerName,
    petName,
    petType,
    petBreed,
  };
};

const enrichAppointmentsBatch = async (
  rawAppointments: any[],
): Promise<EnrichedAppointment[]> => {
  if (!rawAppointments.length) return [];

  try {
    const uniqueSpecialistIds = [
      ...new Set(
        rawAppointments
          .filter((a) => a.specialistId)
          .map((a) => ({ 
            id: a.specialistId, 
            type: a.specialistType 
          }))
      ),
    ];
    
    const uniqueOwnerIds = [
      ...new Set(
        rawAppointments
          .map((a) => a.petOwnerId || a.userId)
          .filter(Boolean)
      ),
    ];
    const uniquePetIds = [...new Set(rawAppointments.map((a) => a.petId).filter(Boolean))];

    const specialistPromises = uniqueSpecialistIds.map(
      async ({ id, type }) => {
        const cacheKey = `${type}_${id}`;
        if (specialistInfoCache.has(cacheKey)) {
          return { id, data: specialistInfoCache.get(cacheKey)! };
        }
        try {
          const info = await specialistService.getSpecialistByUserId(id);
          if (info) {
            specialistInfoCache.set(cacheKey, info);
            return { id, data: info };
          }
        } catch (error) {
          console.error(`Failed to load specialist ${id}:`, error);
        }
        return { id, data: null };
      }
    );

    const ownerPromises = uniqueOwnerIds.map(async (ownerId) => {
      if (userCache.has(ownerId)) {
        return { id: ownerId, data: userCache.get(ownerId)! };
      }
      try {
        const response = await api.get(`/user-service/users/${ownerId}`);
        const user = response.data;
        const userData = {
          firstName: user.firstName || user.first_name || "",
          lastName: user.lastName || user.last_name || "",
          phone: user.phone || user.phoneNumber,
        };
        userCache.set(ownerId, userData);
        return { id: ownerId, data: userData };
      } catch (error) {
        console.error(`Failed to load owner ${ownerId}:`, error);
        return { id: ownerId, data: { firstName: "Unknown", lastName: "" } };
      }
    });

    const petPromises = uniquePetIds.map(async (petId) => {
  if (!petId || petId === 0) {
    return {
      id: petId,
      data: { name: "Не указан", species: "Не указан", breed: "" }
    };
  }
  
  if (petCache.has(petId)) {
    return { id: petId, data: petCache.get(petId)! };
  }
  
  try {
    const response = await api.get(`/pet-management/api/pets/pet/${petId}/full`);
    const data = response.data;
    
    const pet = data.pet || data;
    
    const petData = {
      name: pet.name || "Unknown",
      species: pet.species || pet.type || "Unknown",
      breed: pet.breed || "",
    };
    
    petCache.set(petId, petData);
    return { id: petId, data: petData };
  } catch (error: any) {
    console.error(`Failed to load pet ${petId}:`, error?.response?.status, error?.message);
    
    const fallbackData = { 
      name: "Питомец", 
      species: "Не указан", 
      breed: "" 
    };
    petCache.set(petId, fallbackData);
    
    return { id: petId, data: fallbackData };
  }
});

    const [specialists, owners, pets] = await Promise.all([
      Promise.all(specialistPromises),
      Promise.all(ownerPromises),
      Promise.all(petPromises),
    ]);

    const specialistMap = new Map(specialists.map((s) => [s.id, s.data]));
    const ownerMap = new Map(owners.map((o) => [o.id, o.data]));
    const petMap = new Map(pets.map((p) => [p.id, p.data]));

    const enriched = rawAppointments.map((apt) => {
      const specialist = specialistMap.get(apt.specialistId);
      const owner = ownerMap.get(apt.petOwnerId || apt.userId);
      const pet = petMap.get(apt.petId);

      return {
        ...apt,
        specialistName: specialist
          ? `${specialist.firstName} ${specialist.lastName}`.trim()
          : `Специалист #${apt.specialistId}`,
        specialistInfo: specialist,
        petOwnerName: owner
          ? `${owner.firstName} ${owner.lastName}`.trim()
          : `Владелец #${apt.petOwnerId || apt.userId}`,
        petName: pet?.name || "Не указан",
        petType: pet?.species || "Не указан",
        petBreed: pet?.breed || "",
      };
    });

    return enriched;
  } catch (error) {
    console.error("Error enriching appointments:", error);
    return rawAppointments;
  }
};



export const clearAppointmentsCache = () => {
  userCache.clear();
  petCache.clear();
  specialistInfoCache.clear();
  activeHooksCount = 0;
};



export const useAppointments = (
  config: UseAppointmentsConfig,
): UseAppointmentsReturn => {
  const {
    mode,
    appointmentId,
    filters,
    autoLoad = true,
    pageSize = 10,
    clearCacheOnUnmount = false,
  } = config;

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const filtersKey = useMemo(() => JSON.stringify(filters || {}), [filters]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [createdCount, setCreatedCount] = useState(0);
  const [specialistInfo, setSpecialistInfo] = useState<SpecialistInfo | null>(null);
  const [enriching, setEnriching] = useState(false);

  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);


  
  useEffect(() => {
    activeHooksCount++;
    isMountedRef.current = true;
    
    return () => {
      activeHooksCount--;
      isMountedRef.current = false;
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (clearCacheOnUnmount && activeHooksCount === 0) {
        clearAppointmentsCache();
      }
    };
  }, [clearCacheOnUnmount]);

  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error(defaultMessage, error);
    const message = error?.message || defaultMessage;
    setError(message);
    Alert.alert("Ошибка", message);
  }, []);

  const updateIfMounted = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback();
    }
  }, []);



  const loadOwnerAppointments = useCallback(
    async (page: number = 0, shouldRefresh: boolean = false) => {
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        updateIfMounted(() => {
          setError(null);
          if (shouldRefresh) {
            setRefreshing(true);
          } else if (page === 0) {
            setLoading(true);
          }
        });

        const parsedFilters = filtersKey !== "{}" ? JSON.parse(filtersKey) : undefined;
        
        const response = await appointmentApi.getMyAppointments({
          ...parsedFilters,
          page,
          size: pageSize,
        });

        const newContent = response.content || [];

        if (newContent.length > 0) {
          setEnriching(true);
          const enriched = await enrichAppointmentsBatch(newContent);
          updateIfMounted(() => {
            if (page === 0 || shouldRefresh) {
              setAppointments(enriched);
            } else {
              setAppointments((prev) => [...prev, ...enriched]);
            }
          });
          setEnriching(false);
        } else {
          updateIfMounted(() => {
            if (page === 0 || shouldRefresh) {
              setAppointments([]);
            }
          });
        }

        updateIfMounted(() => {
          setTotalPages(response.totalPages || 0);
          setCurrentPage(response.number || page);
          setHasMore(!response.last && newContent.length > 0);
        });
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          updateIfMounted(() => handleError(error, "Не удалось загрузить записи"));
        }
      } finally {
        updateIfMounted(() => {
          setLoading(false);
          setRefreshing(false);
        });
      }
    },
    [filtersKey, pageSize, handleError, updateIfMounted]
  );



  const loadSpecialistAppointments = useCallback(
    async (shouldRefresh: boolean = false) => {
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        updateIfMounted(() => {
          setError(null);
          if (shouldRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }
        });

        const currentSpecialist = await specialistService.getCurrentSpecialist();
        if (currentSpecialist) {
          setSpecialistInfo(currentSpecialist);
        }

        const parsedFilters = filtersKey !== "{}" ? JSON.parse(filtersKey) : undefined;

        const [allResponse, createdResponse] = await Promise.all([
          appointmentApi.getSpecialistAppointments(parsedFilters),
          appointmentApi.getSpecialistAppointments({
            status: "CREATED",
            size: 1,
          }),
        ]);

        const rawAppointments = allResponse.content || [];

        updateIfMounted(() => {
          setTotalPages(allResponse.totalPages || 0);
          setCreatedCount(createdResponse.totalElements || 0);
        });

        if (rawAppointments.length > 0) {
          setEnriching(true);
          const enriched = await enrichAppointmentsBatch(rawAppointments);
          updateIfMounted(() => {
            setAppointments(enriched);
          });
          setEnriching(false);
        } else {
          updateIfMounted(() => {
            setAppointments([]);
          });
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          updateIfMounted(() => handleError(error, "Не удалось загрузить записи"));
        }
      } finally {
        updateIfMounted(() => {
          setLoading(false);
          setRefreshing(false);
        });
      }
    },
    [filtersKey, handleError, updateIfMounted]
  );



  const loadAppointmentDetails = useCallback(async () => {
    if (!appointmentId || appointmentId === 0) return;

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      updateIfMounted(() => {
        setLoading(true);
        setError(null);
      });

      const [data, recData] = await Promise.all([
        appointmentApi.getAppointmentById(appointmentId),
        appointmentApi.getRecommendations(appointmentId),
      ]);

      const enriched = await enrichSingleAppointment(data);

      updateIfMounted(() => {
        setAppointment(enriched);
        setRecommendations(recData);
      });
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        updateIfMounted(() =>
          handleError(error, "Не удалось загрузить детали записи")
        );
      }
    } finally {
      updateIfMounted(() => setLoading(false));
    }
  }, [appointmentId, handleError, updateIfMounted]);



  const refresh = useCallback(() => {
    switch (mode) {
      case "owner":
        loadOwnerAppointments(0, true);
        break;
      case "specialist":
        loadSpecialistAppointments(true);
        break;
      case "details":
        loadAppointmentDetails();
        break;
    }
  }, [mode, loadOwnerAppointments, loadSpecialistAppointments, loadAppointmentDetails]);

  const loadMore = useCallback(() => {
    if (mode === "owner" && hasMore && !loading && !refreshing) {
      loadOwnerAppointments(currentPage + 1);
    }
  }, [mode, hasMore, loading, refreshing, currentPage, loadOwnerAppointments]);



  const cancelAppointment = useCallback(
    async (id: number, reason: string): Promise<boolean> => {
      try {
        await appointmentApi.cancelAppointment(id, reason);

        updateIfMounted(() => {
          setAppointments((prev) =>
            prev.map((apt) =>
              apt.id === id
                ? {
                    ...apt,
                    status: "CANCELLED_BY_USER",
                    cancellationReason: reason,
                  }
                : apt
            )
          );
        });

        Alert.alert("Успех", "Запись успешно отменена");
        return true;
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось отменить запись");
        return false;
      }
    },
    [updateIfMounted]
  );



  const confirmAppointment = useCallback(
    async (id: number): Promise<AppointmentResponseDto> => {
      try {
        const updated = await appointmentApi.confirmAppointment(id);
        updateIfMounted(() => {
          setAppointments((prev) =>
            prev.map((apt) => (apt.id === id ? { ...apt, ...updated } : apt))
          );
          setCreatedCount((prev) => Math.max(0, prev - 1));
        });
        Alert.alert("Успех", "Запись подтверждена");
        return updated;
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось подтвердить запись");
        throw error;
      }
    },
    [updateIfMounted]
  );

  const cancelBySpecialist = useCallback(
    async (id: number, reason: string): Promise<void> => {
      try {
        await appointmentApi.cancelAppointment(id, `CANCELLED_BY_SPECIALIST: ${reason}`);

        updateIfMounted(() => {
          setAppointments((prev) =>
            prev.map((apt) =>
              apt.id === id 
                ? { 
                    ...apt, 
                    status: "CANCELLED_BY_SPECIALIST",
                    cancellationReason: reason 
                  } 
                : apt
            )
          );
          setCreatedCount((prev) => Math.max(0, prev - 1));
        });
        Alert.alert("Успех", "Запись отклонена");
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось отклонить запись");
        throw error;
      }
    },
    [updateIfMounted]
  );

  const completeAppointment = useCallback(
    async (id: number): Promise<void> => {
      try {
        await appointmentApi.completeAppointment(id);
        updateIfMounted(() => {
          setAppointments((prev) =>
            prev.map((apt) => (apt.id === id ? { ...apt, status: "COMPLETED" } : apt))
          );
        });
        Alert.alert("Успех", "Прием завершен");
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось завершить прием");
        throw error;
      }
    },
    [updateIfMounted]
  );

  const markAsNoShow = useCallback(
    async (id: number): Promise<AppointmentResponseDto> => {
      try {
        const updated = await appointmentApi.markAsNoShow(id);
        updateIfMounted(() => {
          setAppointments((prev) =>
            prev.map((apt) => (apt.id === id ? { ...apt, ...updated } : apt))
          );
        });
        Alert.alert("Успех", "Клиент отмечен как неявившийся");
        return updated;
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось отметить неявку");
        throw error;
      }
    },
    [updateIfMounted]
  );

  const addRecommendations = useCallback(
    async (id: number, recommendationsData: AppointmentRecommendationsDto): Promise<AppointmentResponseDto> => {
      try {
        const updated = await appointmentApi.addRecommendations(id, recommendationsData);
        updateIfMounted(() => {
          setAppointments((prev) =>
            prev.map((apt) => (apt.id === id ? { ...apt, ...updated } : apt))
          );
        });
        Alert.alert("Успех", "Рекомендации добавлены");
        return updated;
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось добавить рекомендации");
        throw error;
      }
    },
    [updateIfMounted]
  );



  const updateAppointment = useCallback(
    async (data: AppointmentUpdateDto): Promise<AppointmentResponseDto> => {
      if (!appointmentId) throw new Error("Appointment ID is required");

      try {
        const updated = await appointmentApi.updateAppointment(appointmentId, data);
        updateIfMounted(() => setAppointment(updated));
        Alert.alert("Успех", "Запись обновлена");
        return updated;
      } catch (error: any) {
        Alert.alert("Ошибка", error?.message || "Не удалось обновить запись");
        throw error;
      }
    },
    [appointmentId, updateIfMounted]
  );


  
  useEffect(() => {
    if (autoLoad) {
      switch (mode) {
        case "owner":
          loadOwnerAppointments(0);
          break;
        case "specialist":
          loadSpecialistAppointments();
          break;
        case "details":
          loadAppointmentDetails();
          break;
      }
    }
  }, [mode, appointmentId, filtersKey, autoLoad]);



  const baseReturn: UseAppointmentsReturn = {
    loading: loading || enriching,
    refreshing,
    error,
    refresh,
  };



  if (mode === "owner") {
    return {
      ...baseReturn,
      appointments,
      hasMore,
      totalPages,
      currentPage,
      loadMore,
      cancelAppointment,
    };
  }



  if (mode === "specialist") {
    return {
      ...baseReturn,
      appointments,
      hasMore: false,
      totalPages,
      currentPage: 0,
      createdCount,
      specialistInfo,
      confirmAppointment,
      cancelBySpecialist,
      completeAppointment,
      markAsNoShow,
      addRecommendations,
    };
  }



  return {
    ...baseReturn,
    appointment,
    recommendations,
    updateAppointment,
  };
};



export const useOwnerAppointments = (filters?: AppointmentFilters) => {
  const stableFilters = useMemo(() => filters, [
    filters?.status,
    filters?.specialistId,
    filters?.petId,
    filters?.page,
    filters?.size,
  ]);
  
  return useAppointments({
    mode: "owner",
    filters: stableFilters,
    autoLoad: true,
  });
};

export const useSpecialistAppointments = (filters?: AppointmentFilters) => {
  const stableFilters = useMemo(() => filters, [
    filters?.status,
    filters?.specialistId,
    filters?.petId,
    filters?.page,
    filters?.size,
  ]);
  
  return useAppointments({
    mode: "specialist",
    filters: stableFilters,
    autoLoad: true,
  });
};

export const useAppointmentDetails = (id: number) => {
  return useAppointments({
    mode: "details",
    appointmentId: id,
    autoLoad: true,
  });
};

export default useAppointments;