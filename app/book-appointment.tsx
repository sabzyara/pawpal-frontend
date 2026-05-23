import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppointment } from '@/services/appointmentApi';

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
  vetId: string;
  date: Date | null;
  timeSlot: string | null;
}

export default function BookAppointmentScreen() {
  const { colors, typography } = useTheme();

  const router = useRouter();

  const { vetId, vetName } =
    useLocalSearchParams();

  const [step, setStep] = useState(1);

  const [loading, setLoading] =
    useState(false);

  const [pets, setPets] = useState<Pet[]>([]);

  const [petsLoading, setPetsLoading] =
    useState(true);

  const [bookingData, setBookingData] =
    useState<BookingData>({
      petId: '',
      vetId: (vetId as string) || '',
      date: null,
      timeSlot: null,
    });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const res = await api.get(
        '/pet-management/api/pets'
      );

      const mappedPets = res.data.map(
        (pet: any) => ({
          id: pet.id.toString(),
          name: pet.name,
          type: pet.species,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          avatarUrl: pet.avatarUrl,
        })
      );

      setPets(mappedPets);
    } catch (error) {
      console.log(error);

      Alert.alert(
        'Error',
        'Failed to load pets'
      );
    } finally {
      setPetsLoading(false);
    }
  };

  const selectedPet = pets.find(
    (p) => p.id === bookingData.petId
  );

  const handleNext = () => {
    if (step === 1 && !bookingData.petId) {
      Alert.alert(
        'Error',
        'Please select a pet'
      );

      return;
    }

    if (
      step === 2 &&
      (!bookingData.date ||
        !bookingData.timeSlot)
    ) {
      Alert.alert(
        'Error',
        'Please select date and time'
      );

      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirmBooking =
    async () => {
      try {
        setLoading(true);

        const token =
          await AsyncStorage.getItem(
            'token'
          );

        if (!token) {
          Alert.alert(
            'Error',
            'Token not found'
          );

          return;
        }

        await createAppointment(token, {
          specialistId: Number(
            bookingData.vetId
          ),

          specialistType: 'VET',

          petId: Number(
            bookingData.petId
          ),

          date: bookingData.date!
            .toISOString()
            .split('T')[0],

          startTime:
            bookingData.timeSlot!,
        });

        Alert.alert(
          'Success',
          'Appointment created successfully',
          [
            {
              text: 'OK',
              onPress: () =>
                router.push(
                  '/my_appointments'
                ),
            },
          ]
        );
      } catch (error: any) {
        console.log(error);

        Alert.alert(
          'Error',
          error.message ||
            'Failed to create appointment'
        );
      } finally {
        setLoading(false);
      }
    };

  const renderStepIndicator = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor:
          colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor:
          colors.border.light,
      }}
    >
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,

              backgroundColor:
                step >= s
                  ? colors.primary.main
                  : colors.background
                      .tertiary,

              alignItems: 'center',
              justifyContent: 'center',

              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color:
                  step >= s
                    ? colors.text.inverse
                    : colors.text.secondary,

                fontWeight: '600',
              }}
            >
              {s}
            </Text>
          </View>

          <Text
            style={[
              typography.caption,
              {
                color:
                  step >= s
                    ? colors.primary.main
                    : colors.text.secondary,
              },
            ]}
          >
            {s === 1 && 'Pet'}
            {s === 2 && 'Date & Time'}
            {s === 3 && 'Confirm'}
          </Text>
        </View>
      ))}
    </View>
  );

  if (petsLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          colors.background.secondary,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 16,

          backgroundColor:
            colors.background.primary,

          borderBottomWidth: 1,

          borderBottomColor:
            colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginBottom: 12,
            padding: 4,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>

        <Text
          style={[
            typography.h2,
            {
              color: colors.text.primary,
            },
          ]}
        >
          Book Appointment
        </Text>

        <Text
          style={[
            typography.body2,
            {
              color:
                colors.text.secondary,

              marginTop: 4,
            },
          ]}
        >
          {vetName
            ? `with ${vetName}`
            : 'Schedule a visit'}
        </Text>
      </View>

      {renderStepIndicator()}

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        {step === 1 && (
          <PetSelector
            pets={pets}
            selectedPetId={
              bookingData.petId
            }
            onSelectPet={(petId) =>
              setBookingData({
                ...bookingData,
                petId,
              })
            }
          />
        )}

        {step === 2 && (
          <DateTimeSelector
            selectedDate={
              bookingData.date
            }
            selectedTime={
              bookingData.timeSlot
            }
            onSelectDate={(date) =>
              setBookingData({
                ...bookingData,
                date,
              })
            }
            onSelectTime={(time) =>
              setBookingData({
                ...bookingData,
                timeSlot: time,
              })
            }
          />
        )}

        {step === 3 && (
          <BookingSummary
            pet={selectedPet}
            vetName={
              (vetName as string) ||
              'Veterinarian'
            }
            date={bookingData.date}
            timeSlot={
              bookingData.timeSlot
            }
            onConfirm={
              handleConfirmBooking
            }
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

            gap: 12,

            padding: 20,

            backgroundColor:
              colors.background.primary,

            borderTopWidth: 1,

            borderTopColor:
              colors.border.light,
          }}
        >
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                flex: 1,

                padding: 16,

                borderRadius: 16,

                alignItems: 'center',

                backgroundColor:
                  colors.background
                    .tertiary,

                borderWidth: 1,

                borderColor:
                  colors.border.light,
              }}
            >
              <Text
                style={[
                  typography.button,
                  {
                    color:
                      colors.text.primary,
                  },
                ]}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: 1,

              padding: 16,

              borderRadius: 16,

              alignItems: 'center',

              backgroundColor:
                colors.primary.main,
            }}
          >
            <Text
              style={[
                typography.button,
                {
                  color:
                    colors.text.inverse,
                },
              ]}
            >
              {step === 2
                ? 'Review'
                : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}