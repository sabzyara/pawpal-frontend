import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { appointmentApi, timeSlotApi } from '@/services/appointmentApi';
import { useUser } from '@/hooks/useUser';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BookingSummary } from '@/components/book/BookingSummary';
import { DateTimeSelector } from '@/components/book/DateTimeSelector';
import { PetSelector } from '@/components/book/PetSelector';

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
  specialistId: number;
  specialistType: 'VET' | 'SERVICE';
  petOwnerId: number;
  timeSlotId: number | null;
  date: Date | null;
  timeSlot: string | null;
}

export default function BookAppointmentScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { specialistId, specialistName, specialistType } = useLocalSearchParams();
  const { getCurrentUserId, isAuthenticated } = useUser();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsLoading, setPetsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  const [bookingData, setBookingData] = useState<BookingData>({
    petId: '',
    specialistId: Number(specialistId) || 0,
    specialistType: (specialistType as 'VET' | 'SERVICE') || 'VET',
    petOwnerId: 0,
    timeSlotId: null,
    date: null,
    timeSlot: null,
  });

  useEffect(() => {
    loadPets();
    const userId = getCurrentUserId();
    if (userId) {
      setBookingData(prev => ({ ...prev, petOwnerId: userId }));
    }
  }, [getCurrentUserId]);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Требуется авторизация',
        'Пожалуйста, войдите в аккаунт для записи к специалисту',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    }
  }, [isAuthenticated, router]);

  const loadPets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await api.get('/pet-management/api/pets', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const mappedPets = response.data.map((pet: any) => ({
        id: pet.id.toString(),
        name: pet.name,
        type: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        avatarUrl: pet.avatarUrl || 'https://via.placeholder.com/60',
      }));

      setPets(mappedPets);
    } catch (error) {
      console.error('Error loading pets:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить питомцев');
    } finally {
      setPetsLoading(false);
    }
  };

  const loadAvailableSlots = async (date: Date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    const result = await timeSlotApi.getAvailableSlotsForDate(
      bookingData.specialistId,
      bookingData.specialistType,
      formattedDate
    );
    setAvailableSlots(result.content);  // ✅ берём content
  } catch (error) {
    console.error('Failed to load slots:', error);
    Alert.alert('Ошибка', 'Не удалось загрузить доступное время');
  }
};


  const selectedPet = pets.find((p) => p.id === bookingData.petId);

  const handleSelectDate = async (date: Date) => {
    setBookingData({ ...bookingData, date, timeSlot: null, timeSlotId: null });
    await loadAvailableSlots(date);
  };

  const handleSelectTime = (slotId: number, startTime: string) => {
    setBookingData({ 
      ...bookingData, 
      timeSlot: startTime,
      timeSlotId: slotId 
    });
  };

  const handleNext = () => {
    if (step === 1 && !bookingData.petId) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите питомца');
      return;
    }

    if (step === 2 && (!bookingData.date || !bookingData.timeSlot)) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите дату и время');
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirmBooking = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      Alert.alert('Ошибка', 'Пользователь не авторизован');
      return;
    }

    if (!bookingData.timeSlotId) {
      Alert.alert('Ошибка', 'Не выбран слот времени');
      return;
    }

    try {
      setLoading(true);

      await appointmentApi.createAppointment({
        specialistId: bookingData.specialistId,
        specialistType: bookingData.specialistType,
        petOwnerId: userId,
        petId: Number(bookingData.petId),
        timeSlotId: bookingData.timeSlotId,
        ownerNotes: '',
      });

      Alert.alert('Успех', 'Запись успешно создана', [
        { text: 'OK', onPress: () => router.push('/appointments') },
      ]);
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      Alert.alert('Ошибка', error?.message || 'Не удалось создать запись');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
      }}
    >
      {[1, 2, 3].map((s) => (
        <View key={s} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: step >= s ? colors.primary.main : colors.background.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xs,
            }}
          >
            <Text style={{ color: step >= s ? colors.text.inverse : colors.text.secondary, fontWeight: '600' }}>
              {s}
            </Text>
          </View>
          <Text style={[typography.caption, { color: step >= s ? colors.primary.main : colors.text.secondary }]}>
            {s === 1 && 'Питомец'}
            {s === 2 && 'Дата и время'}
            {s === 3 && 'Подтверждение'}
          </Text>
        </View>
      ))}
    </View>
  );

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary, padding: spacing.lg }}>
        <Ionicons name="lock-closed-outline" size={64} color={colors.text.secondary} />
        <Text style={[typography.h3, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]}>
          Требуется авторизация
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
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

  if (petsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
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
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: spacing.sm, padding: spacing.xs }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Запись к специалисту
        </Text>

        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.xs }]}>
          {specialistName ? `к ${specialistName}` : 'Запись на прием'}
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
            onSelectPet={(petId) => setBookingData({ ...bookingData, petId })}
          />
        )}

        {step === 2 && (
          <DateTimeSelector
            specialistId={bookingData.specialistId}
            specialistType={bookingData.specialistType}
            selectedDate={bookingData.date}
            selectedTime={bookingData.timeSlot}
            onSelectDate={handleSelectDate}
            onSelectTime={(startTime: string) => {
              const slot = availableSlots.find(s => s.startTime === startTime);
              if (slot) {
                handleSelectTime(slot.id, startTime);
              }
            }}
          />
        )}

        {step === 3 && (
          <BookingSummary
            pet={selectedPet}
            specialistName={(specialistName as string) || 'Специалист'}
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
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
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
                alignItems: 'center',
                backgroundColor: colors.background.tertiary,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={[typography.button, { color: colors.text.primary }]}>Назад</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: 1,
              padding: spacing.md,
              borderRadius: spacing.md,
              alignItems: 'center',
              backgroundColor: colors.primary.main,
            }}
          >
            <Text style={[typography.button, { color: colors.text.inverse }]}>
              {step === 2 ? 'Проверить' : 'Продолжить'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}