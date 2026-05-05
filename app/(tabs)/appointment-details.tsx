import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentDetail {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  petBreed: string;
  petAge: number;
  petAvatar: string;
  vetId: string;
  vetName: string;
  vetSpecialty: string;
  vetAvatar: string;
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function AppointmentDetailsScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock appointment details
  const mockAppointment: AppointmentDetail = {
    id: id as string || '1',
    petId: '1',
    petName: 'Max',
    petType: 'Dog',
    petBreed: 'Golden Retriever',
    petAge: 3,
    petAvatar: 'https://i.pravatar.cc/150?img=9',
    vetId: '1',
    vetName: 'Dr. Leslie Alexander',
    vetSpecialty: 'Pediatrician',
    vetAvatar: 'https://i.pravatar.cc/150?img=1',
    serviceId: '1',
    serviceName: 'General Checkup',
    serviceDescription: 'Complete physical examination and health assessment',
    servicePrice: 85,
    serviceDuration: 30,
    date: '2024-06-15',
    timeSlot: '10:30 AM',
    status: 'upcoming',
    notes: 'Please bring previous medical records',
    createdAt: '2024-06-01',
  };

  useEffect(() => {
    setTimeout(() => {
      setAppointment(mockAppointment);
      setLoading(false);
    }, 500);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#FF5252';
      case 'pending': return '#FFC107';
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Appointment has been cancelled');
            router.back();
          }
        },
      ]
    );
  };

  const handleReschedule = () => {
    router.push({
      pathname: '/book-appointment',
      params: { 
        editId: appointment?.id,
        vetId: appointment?.vetId,
        vetName: appointment?.vetName,
        petId: appointment?.petId,
      }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.primary }}>Appointment not found</Text>
      </View>
    );
  }

  const isUpcoming = appointment.status === 'upcoming' && new Date(appointment.date) >= new Date();

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
          Appointment Details
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(appointment.status) }} />
          <Text style={[typography.body2, { color: getStatusColor(appointment.status), fontWeight: '600' }]}>
            {getStatusText(appointment.status)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pet Info */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            ...(colors.card.default === '#FFFFFF' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }),
          }}
        >
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 12 }]}>
            Pet Information
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 48 }}>{appointment.petType === 'Dog' ? '🐕' : '🐈'}</Text>
            <View>
              <Text style={[typography.h4, { color: colors.text.primary }]}>
                {appointment.petName}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {appointment.petBreed} • {appointment.petAge} years old
              </Text>
            </View>
          </View>
        </View>

        {/* Vet Info */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            ...(colors.card.default === '#FFFFFF' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }),
          }}
        >
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 12 }]}>
            Veterinarian
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.background.tertiary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
            </View>
            <View>
              <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
                {appointment.vetName}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {appointment.vetSpecialty}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Info */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            ...(colors.card.default === '#FFFFFF' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }),
          }}
        >
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 12 }]}>
            Service Details
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[typography.body2, { color: colors.text.secondary }]}>Service</Text>
              <Text style={[typography.body2, { color: colors.text.primary, fontWeight: '500' }]}>
                {appointment.serviceName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[typography.body2, { color: colors.text.secondary }]}>Duration</Text>
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {appointment.serviceDuration} minutes
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[typography.body2, { color: colors.text.secondary }]}>Price</Text>
              <Text style={[typography.h4, { color: colors.primary.main }]}>
                ${appointment.servicePrice}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            ...(colors.card.default === '#FFFFFF' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }),
          }}
        >
          <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 12 }]}>
            Date & Time
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="calendar" size={20} color={colors.primary.main} />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {formatDate(appointment.date)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="time" size={20} color={colors.primary.main} />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {appointment.timeSlot}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View
            style={{
              backgroundColor: colors.card.default,
              borderRadius: 20,
              padding: 16,
              marginBottom: 16,
              ...(colors.card.default === '#FFFFFF' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }),
            }}
          >
            <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 8 }]}>
              Notes
            </Text>
            <Text style={[typography.body2, { color: colors.text.secondary }]}>
              {appointment.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {isUpcoming && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleReschedule}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                borderRadius: 16,
                backgroundColor: colors.primary.main,
              }}
            >
              <Ionicons name="create-outline" size={20} color={colors.text.inverse} />
              <Text style={[typography.button, { color: colors.text.inverse }]}>
                Reschedule Appointment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancelAppointment}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                borderRadius: 16,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#FF5252',
              }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FF5252" />
              <Text style={[typography.button, { color: '#FF5252' }]}>
                Cancel Appointment
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}