// app/book-appointment.tsx

import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/authStore";
import { useUserRole } from "@/hooks/useAuth";
import api from "@/services/api";
import { appointmentApi, timeSlotApi, specialistService } from "@/services/appointmentApi";
import type { SpecialistType, AppointmentCreateDto } from "@/services/appointmentApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { BookingSummary } from "@/components/book/BookingSummary";
import { DateTimeSelector } from "@/components/book/DateTimeSelector";
import { PetSelector } from "@/components/book/PetSelector";

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  avatarUrl: string;
}

interface BookingData {
  petId: string;
  specialistUserId: number;
  specialistType: SpecialistType;
  petOwnerId: number;
  timeSlotId: number | null;
  date: Date | null;
  timeSlot: string | null;
}

export default function BookAppointmentScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { specialistUserId, specialistName, specialistType: specialistTypeParam } = useLocalSearchParams<{
    specialistUserId: string;
    specialistName: string;
    specialistType: string;
  }>();
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [specialistInfo, setSpecialistInfo] = useState<{ specialistId: number; specialistType: SpecialistType } | null>(null);
  const [loadingSpecialist, setLoadingSpecialist] = useState(true);

  const initialSpecialistType: SpecialistType = 
    specialistTypeParam === "SERVICE" ? "SERVICE" : "VET";

  const [bookingData, setBookingData] = useState<BookingData>({
    petId: "",
    specialistUserId: Number(specialistUserId) || 0,
    specialistType: initialSpecialistType,
    petOwnerId: 0,
    timeSlotId: null,
    date: null,
    timeSlot: null,
  });

  // Загружаем информацию о специалисте
  useEffect(() => {
    const loadSpecialistInfo = async () => {
      if (!bookingData.specialistUserId || bookingData.specialistUserId === 0) {
        console.error("No specialistUserId provided");
        setLoadingSpecialist(false);
        return;
      }
      
      try {
        setLoadingSpecialist(true);
        const info = await specialistService.getSpecialistByUserId(bookingData.specialistUserId);
        setSpecialistInfo({
          specialistId: info.specialistId,
          specialistType: info.specialistType,
        });
      } catch (error) {
        console.error("Error loading specialist info:", error);
        Alert.alert("Ошибка", "Не удалось найти профиль специалиста");
      } finally {
        setLoadingSpecialist(false);
      }
    };

    loadSpecialistInfo();
  }, [bookingData.specialistUserId]);

  // Загрузка питомцев
  useEffect(() => {
    loadPets();
    if (user?.id) {
      setBookingData((prev) => ({ ...prev, petOwnerId: user.id }));
    }
  }, [user?.id]);

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Требуется авторизация",
        "Пожалуйста, войдите в аккаунт для записи к специалисту",
        [{ text: "OK", onPress: () => router.back() }],
      );
    }
  }, [isAuthenticated, router]);

  const loadPets = async () => {
    try {
      setPetsLoading(true);
      const response = await api.get("/pet-management/api/pets");

      const mappedPets = (response.data || []).map((pet: any) => ({
        id: pet.id?.toString() || String(pet.petId) || String(pet.id),
        name: pet.name || "Без имени",
        type: pet.species || pet.type || "Не указан",
        breed: pet.breed || "",
        age: pet.age || 0,
        weight: pet.weight || 0,
        avatarUrl: pet.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.name || 'Pet')}&background=random`,
      }));

      setPets(mappedPets);
    } catch (error) {
      console.error("Error loading pets:", error);
      Alert.alert("Ошибка", "Не удалось загрузить питомцев");
    } finally {
      setPetsLoading(false);
    }
  };

  const selectedPet = pets.find((p) => p.id === bookingData.petId);

  const handleSelectDate = useCallback((date: Date) => {
    setBookingData((prev) => ({ ...prev, date, timeSlot: null, timeSlotId: null }));
  }, []);

  const handleSelectTime = useCallback((startTime: string, slotId?: number) => {
    setBookingData((prev) => ({
      ...prev,
      timeSlot: startTime,
      timeSlotId: slotId || null,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1 && !bookingData.petId) {
      Alert.alert("Ошибка", "Пожалуйста, выберите питомца");
      return;
    }

    if (step === 2 && (!bookingData.date || !bookingData.timeSlot)) {
      Alert.alert("Ошибка", "Пожалуйста, выберите дату и время");
      return;
    }

    setStep((prev) => prev + 1);
  }, [step, bookingData.petId, bookingData.date, bookingData.timeSlot]);

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      Alert.alert("Ошибка", "Пользователь не авторизован");
      return;
    }

    if (!bookingData.timeSlotId) {
      Alert.alert("Ошибка", "Не выбран слот времени");
      return;
    }

    if (!specialistInfo) {
      Alert.alert("Ошибка", "Информация о специалисте не загружена");
      return;
    }

    // Проверка, что дата не прошедшая
    if (bookingData.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingData.date < today) {
        Alert.alert("Ошибка", "Нельзя записаться на прошедшую дату");
        return;
      }
    }

    try {
      setLoading(true);

      const appointmentData: AppointmentCreateDto = {
        specialistId: specialistInfo.specialistId,
        specialistType: specialistInfo.specialistType,
        petOwnerId: userId,
        petId: Number(bookingData.petId),
        timeSlotId: bookingData.timeSlotId,
        ownerNotes: "", 
      };

      console.log("📤 Creating appointment:", appointmentData);

      await appointmentApi.createAppointment(appointmentData);

      Alert.alert("Успех", "Запись успешно создана", [
        { text: "OK", onPress: () => router.push("/my_appointments") },
      ]);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      
      if (error?.message?.includes("already booked")) {
        Alert.alert("Ошибка", "Это время уже занято. Пожалуйста, выберите другое время");
      } else if (error?.message?.includes("past")) {
        Alert.alert("Ошибка", "Нельзя записаться на прошедшее время");
      } else {
        Alert.alert("Ошибка", error?.message || "Не удалось создать запись");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, bookingData, specialistInfo, router]);

  const renderStepIndicator = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
      }}
    >
      {[1, 2, 3].map((s) => (
        <View key={s} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor:
                step >= s ? colors.primary.main : colors.background.tertiary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: spacing.xs,
            }}
          >
            <Text
              style={{
                color: step >= s ? colors.text.inverse : colors.text.secondary,
                fontWeight: "600",
              }}
            >
              {s}
            </Text>
          </View>
          <Text
            style={[
              typography.caption,
              {
                color: step >= s ? colors.primary.main : colors.text.secondary,
              },
            ]}
          >
            {s === 1 && "Питомец"}
            {s === 2 && "Дата и время"}
            {s === 3 && "Подтверждение"}
          </Text>
        </View>
      ))}
    </View>
  );

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.secondary,
          padding: spacing.lg,
        }}
      >
        <Ionicons
          name="lock-closed-outline"
          size={64}
          color={colors.text.secondary}
        />
        <Text
          style={[
            typography.h3,
            {
              color: colors.text.primary,
              marginTop: spacing.md,
              textAlign: "center",
            },
          ]}
        >
          Требуется авторизация
        </Text>
        <Text
          style={[
            typography.body2,
            {
              color: colors.text.secondary,
              marginTop: spacing.xs,
              textAlign: "center",
            },
          ]}
        >
          Пожалуйста, войдите в аккаунт для записи к специалисту
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: spacing.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.primary.main,
            borderRadius: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Загрузка информации о специалисте
  if (loadingSpecialist) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.secondary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.md },
          ]}
        >
          Загрузка информации о специалисте...
        </Text>
      </View>
    );
  }

  // Если специалист не найден
  if (!specialistInfo) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.secondary,
          padding: spacing.lg,
        }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={colors.error?.main || "#F44336"}
        />
        <Text
          style={[
            typography.h3,
            {
              color: colors.text.primary,
              marginTop: spacing.md,
              textAlign: "center",
            },
          ]}
        >
          Специалист не найден
        </Text>
        <Text
          style={[
            typography.body2,
            {
              color: colors.text.secondary,
              marginTop: spacing.xs,
              textAlign: "center",
            },
          ]}
        >
          Пользователь не зарегистрирован как специалист
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: spacing.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.primary.main,
            borderRadius: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Загрузка питомцев
  if (petsLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.secondary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.md },
          ]}
        >
          Загрузка питомцев...
        </Text>
      </View>
    );
  }

  // Если нет питомцев
  if (pets.length === 0 && !petsLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.secondary,
          padding: spacing.lg,
        }}
      >
        <Ionicons
          name="paw-outline"
          size={64}
          color={colors.text.secondary}
        />
        <Text
          style={[
            typography.h3,
            {
              color: colors.text.primary,
              marginTop: spacing.md,
              textAlign: "center",
            },
          ]}
        >
          Нет добавленных питомцев
        </Text>
        <Text
          style={[
            typography.body2,
            {
              color: colors.text.secondary,
              marginTop: spacing.xs,
              textAlign: "center",
            },
          ]}
        >
          Добавьте питомца в профиле, чтобы записаться на прием
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/add")}
          style={{
            marginTop: spacing.lg,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.primary.main,
            borderRadius: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Добавить питомца</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      {/* HEADER */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: spacing.sm, padding: spacing.xs }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Запись к специалисту
        </Text>

        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.xs },
          ]}
        >
          {specialistName ? `к ${specialistName}` : "Запись на прием"}
        </Text>
      </View>

      {renderStepIndicator()}

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <PetSelector
            pets={pets}
            selectedPetId={bookingData.petId}
            onSelectPet={(petId) => setBookingData((prev) => ({ ...prev, petId }))}
          />
        )}

        {step === 2 && (
          <DateTimeSelector
            userId={bookingData.specialistUserId}
            specialistType={specialistInfo.specialistType}
            selectedDate={bookingData.date}
            selectedTime={bookingData.timeSlot}
            onSelectDate={handleSelectDate}
            onSelectTime={handleSelectTime}
          />
        )}

        {step === 3 && (
          <BookingSummary
            pet={selectedPet}
            specialistName={(specialistName as string) || "Специалист"}
            date={bookingData.date}
            timeSlot={bookingData.timeSlot}
            onConfirm={handleConfirmBooking}
            loading={loading}
          />
        )}
      </ScrollView>

      {step < 3 && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            gap: spacing.sm,
            padding: spacing.lg,
            backgroundColor: colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: colors.border.light,
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                flex: 1,
                padding: spacing.md,
                borderRadius: spacing.md,
                alignItems: "center",
                backgroundColor: colors.background.tertiary,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={[typography.button, { color: colors.text.primary }]}>
                Назад
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: spacing.md,
              alignItems: "center",
              backgroundColor: colors.primary.main,
            }}
          >
            <Text style={[typography.button, { color: colors.text.inverse }]}>
              {step === 2 ? "Проверить" : "Продолжить"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}