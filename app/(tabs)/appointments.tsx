import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  petType: string;
  petAvatar: string;
  vetId: string;
  vetName: string;
  vetSpecialty: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  createdAt: string;
}

export default function AppointmentsScreen() {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock appointments data
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      petId: '1',
      petName: 'Max',
      petType: 'Dog',
      petAvatar: 'https://i.pravatar.cc/150?img=9',
      vetId: '1',
      vetName: 'Dr. Leslie Alexander',
      vetSpecialty: 'Pediatrician',
      serviceId: '1',
      serviceName: 'General Checkup',
      servicePrice: 85,
      date: '2024-06-15',
      timeSlot: '10:30 AM',
      status: 'upcoming',
      notes: 'Regular checkup',
      createdAt: '2024-06-01',
    },
    {
      id: '2',
      petId: '2',
      petName: 'Luna',
      petType: 'Cat',
      petAvatar: 'https://i.pravatar.cc/150?img=11',
      vetId: '2',
      vetName: 'Dr. Ronald Richards',
      vetSpecialty: 'Cardiologist',
      serviceId: '2',
      serviceName: 'Vaccination',
      servicePrice: 65,
      date: '2024-06-20',
      timeSlot: '02:00 PM',
      status: 'upcoming',
      notes: 'Annual vaccination',
      createdAt: '2024-06-02',
    },
    {
      id: '3',
      petId: '3',
      petName: 'Charlie',
      petType: 'Dog',
      petAvatar: 'https://i.pravatar.cc/150?img=13',
      vetId: '3',
      vetName: 'Dr. Annette Black',
      vetSpecialty: 'Pediatrician',
      serviceId: '3',
      serviceName: 'Dental Cleaning',
      servicePrice: 150,
      date: '2024-05-10',
      timeSlot: '11:00 AM',
      status: 'completed',
      notes: 'Dental cleaning done',
      createdAt: '2024-05-01',
    },
    {
      id: '4',
      petId: '1',
      petName: 'Max',
      petType: 'Dog',
      petAvatar: 'https://i.pravatar.cc/150?img=9',
      vetId: '5',
      vetName: 'Dr. James Wilson',
      vetSpecialty: 'Emergency Care',
      serviceId: '5',
      serviceName: 'Emergency Visit',
      servicePrice: 200,
      date: '2024-06-25',
      timeSlot: '09:00 AM',
      status: 'pending',
      notes: 'Follow-up required',
      createdAt: '2024-06-03',
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setAppointments(mockAppointments);
    setRefreshing(false);
  };

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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const AppointmentCard = ({ item }: { item: Appointment }) => {
    const isPast = new Date(item.date) < new Date() && item.status === 'upcoming';
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/appointment-details',
          params: { id: item.id }
        })}
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
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(item.status) }} />
            <Text style={[typography.caption, { color: getStatusColor(item.status), fontWeight: '600' }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            ID: #{item.id}
          </Text>
        </View>

        {/* Pet Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 32 }}>{item.petType === 'Dog' ? '🐕' : '🐈'}</Text>
          <View>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {item.petName}
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {item.serviceName} • {item.vetName}
            </Text>
          </View>
        </View>

        {/* Date and Time */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {item.timeSlot}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[typography.h4, { color: colors.primary.main }]}>
            ${item.servicePrice}
          </Text>
          {item.status === 'upcoming' && !isPast && (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/book-appointment',
                params: { 
                  editId: item.id,
                  vetId: item.vetId,
                  vetName: item.vetName,
                }
              })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: colors.background.tertiary,
              }}
            >
              <Ionicons name="create-outline" size={14} color={colors.primary.main} />
              <Text style={[typography.caption, { color: colors.primary.main, fontWeight: '600' }]}>
                Reschedule
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Past appointment note */}
        {isPast && (
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: 8 }]}>
            This appointment has passed
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
      }}
    >
      <Ionicons name="calendar-outline" size={64} color={colors.text.tertiary} />
      <Text style={[typography.h4, { color: colors.text.primary, marginTop: 20 }]}>
        No Appointments
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginTop: 8, textAlign: 'center' }]}>
        You don't have any appointments yet.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/vets-list')}
        style={{
          marginTop: 20,
          paddingVertical: 12,
          paddingHorizontal: 24,
          backgroundColor: colors.primary.main,
          borderRadius: 25,
        }}
      >
        <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>
          Find a Vet
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Separate appointments by status
  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming' && new Date(a.date) >= new Date());
  const pastAppointments = appointments.filter(a => a.status !== 'upcoming' || new Date(a.date) < new Date());

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.secondary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

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
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          My Appointments
        </Text>
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: 4 }]}>
          {appointments.length} total appointments
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: colors.primary.main,
          }}
        >
          <Text style={[typography.body2, { color: colors.primary.main, fontWeight: '600' }]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
}