import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { BookingSummary } from '@/components/book/BookingSummary';
import { DateTimeSelector } from '@/components/book/DateTimeSelector';
import { PetSelector } from '@/components/book/PetSelector';
import { ServiceSelector } from '@/components/book/ServiceSelector';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  avatarUrl: string;
  medicalHistory?: string[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'checkup' | 'vaccination' | 'surgery' | 'dental' | 'emergency';
}

interface BookingData {
  petId: string;
  vetId: string;
  date: Date | null;
  timeSlot: string | null;
  serviceId: string;
  notes: string;
}

export default function BookAppointmentScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { vetId, vetName } = useLocalSearchParams();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingData, setBookingData] = useState<BookingData>({
    petId: '',
    vetId: vetId as string || '',
    date: null,
    timeSlot: null,
    serviceId: '',
    notes: '',
  });

  // Mock user's pets
  const mockPets: Pet[] = [
    {
      id: '1',
      name: 'Max',
      type: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 32,
      avatarUrl: 'https://i.pravatar.cc/150?img=9',
      medicalHistory: ['Vaccinated 2024', 'Regular checkup'],
    },
    {
      id: '2',
      name: 'Luna',
      type: 'Cat',
      breed: 'Persian',
      age: 2,
      weight: 4.5,
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      medicalHistory: ['Spayed', 'Vaccinated 2024'],
    },
    {
      id: '3',
      name: 'Charlie',
      type: 'Dog',
      breed: 'Beagle',
      age: 5,
      weight: 15,
      avatarUrl: 'https://i.pravatar.cc/150?img=13',
      medicalHistory: ['Dental cleaning 2023'],
    },
  ];

  // Mock services
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'General Checkup',
      description: 'Complete physical examination and health assessment',
      price: 85,
      duration: 30,
      category: 'checkup',
    },
    {
      id: '2',
      name: 'Vaccination',
      description: 'Core vaccines including rabies and distemper',
      price: 65,
      duration: 20,
      category: 'vaccination',
    },
    {
      id: '3',
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning and oral examination',
      price: 150,
      duration: 60,
      category: 'dental',
    },
    {
      id: '4',
      name: 'Surgery Consultation',
      description: 'Pre-surgery evaluation and planning',
      price: 120,
      duration: 45,
      category: 'surgery',
    },
    {
      id: '5',
      name: 'Emergency Visit',
      description: 'Urgent care for unexpected health issues',
      price: 200,
      duration: 60,
      category: 'emergency',
    },
  ];

  useEffect(() => {
    // Load pets and services
    setTimeout(() => {
      setPets(mockPets);
      setServices(mockServices);
    }, 500);
  }, []);

  const selectedPet = pets.find(p => p.id === bookingData.petId);
  const selectedService = services.find(s => s.id === bookingData.serviceId);

  const handleNext = () => {
    if (step === 1 && !bookingData.petId) {
      Alert.alert('Error', 'Please select a pet');
      return;
    }
    if (step === 2 && (!bookingData.date || !bookingData.timeSlot)) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }
    if (step === 3 && !bookingData.serviceId) {
      Alert.alert('Error', 'Please select a service');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    Alert.alert(
      'Appointment Booked!',
      `Your appointment with ${vetName || 'Dr. Smith'} has been scheduled for ${bookingData.date?.toLocaleDateString()} at ${bookingData.timeSlot}`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/my_appointments'),
        },
      ]
    );
    setLoading(false);
  };

  const renderStepIndicator = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
      }}
    >
      {[1, 2, 3, 4].map((s) => (
        <View key={s} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: step >= s ? colors.primary.main : colors.background.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: step >= s ? colors.text.inverse : colors.text.secondary,
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
                color: step >= s ? colors.primary.main : colors.text.secondary,
              },
            ]}
          >
            {s === 1 && 'Pet'}
            {s === 2 && 'Date & Time'}
            {s === 3 && 'Service'}
            {s === 4 && 'Confirm'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 12, padding: 4 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          Book Appointment
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: 4 }]}>
          {vetName ? `with ${vetName}` : 'Schedule a visit'}
        </Text>
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
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
            selectedDate={bookingData.date}
            selectedTime={bookingData.timeSlot}
            onSelectDate={(date) => setBookingData({ ...bookingData, date })}
            onSelectTime={(time) => setBookingData({ ...bookingData, timeSlot: time })}
          />
        )}

        {step === 3 && (
          <ServiceSelector
            services={services}
            selectedServiceId={bookingData.serviceId}
            onSelectService={(serviceId) => setBookingData({ ...bookingData, serviceId })}
          />
        )}

        {step === 4 && (
          <BookingSummary
            pet={selectedPet}
            vetName={vetName as string || 'Dr. Smith'}
            date={bookingData.date}
            timeSlot={bookingData.timeSlot}
            service={selectedService}
            onConfirm={handleConfirmBooking}
            loading={loading}
          />
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      {step < 4 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            gap: 12,
            padding: 20,
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
                padding: 16,
                borderRadius: 16,
                alignItems: 'center',
                backgroundColor: colors.background.tertiary,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Text style={[typography.button, { color: colors.text.primary }]}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: step > 1 ? 1 : 1,
              padding: 16,
              borderRadius: 16,
              alignItems: 'center',
              backgroundColor: colors.primary.main,
            }}
          >
            <Text style={[typography.button, { color: colors.text.inverse }]}>
              {step === 3 ? 'Review' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}