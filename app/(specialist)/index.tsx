// app/(specialist)/index.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { appointmentApi, specialistService } from '@/services/appointmentApi';
import type { AppointmentResponseDto, SpecialistInfo } from '@/services/appointmentApi';

interface DisplayAppointment {
  id: number;
  status: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  petOwnerId?: number;
  petId?: number;
  displayPetOwnerName: string;
  displayPetName: string;
  original: AppointmentResponseDto;
}

export default function SpecialistHomeScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { profile, fetchProfile } = useProfileStore();

  const [specialistInfo, setSpecialistInfo] = useState<SpecialistInfo | null>(null);
  const [appointments, setAppointments] = useState<DisplayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);

  const loadSpecialistInfo = useCallback(async () => {
    if (!user?.id || !token) return;
    
    try {
      const info = await specialistService.getSpecialistByUserId(user.id);
      setSpecialistInfo(info);
      return info;
    } catch (error) {
      console.error('Error loading specialist info:', error);
      return null;
    }
  }, [user?.id, token]);

  const loadAppointments = useCallback(async () => {
    if (!token) return;

    try {
      const response = await appointmentApi.getSpecialistAppointments({
        page: 0,
        size: 50,
      });
      
      const content = response.content || [];
      
      const displayAppointments: DisplayAppointment[] = content.map((apt: AppointmentResponseDto) => ({
        id: apt.id,
        status: apt.status,
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        petOwnerId: apt.petOwnerId,
        petId: apt.petId,
        displayPetOwnerName: apt.petOwnerName || `Client #${apt.petOwnerId}`,
        displayPetName: apt.petName || 'Pet',
        original: apt,
      }));
      
      setAppointments(displayAppointments);
      
      const created = content.filter((apt: AppointmentResponseDto) => apt.status === 'CREATED').length;
      setCreatedCount(created);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
      setCreatedCount(0);
    }
  }, [token]);

  const loadData = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      await Promise.all([
        loadSpecialistInfo(),
        loadAppointments(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [token, loadSpecialistInfo, loadAppointments]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    if (user) {
      await fetchProfile(user);
    }
    setRefreshing(false);
  }, [loadData, user, fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getDisplayName = () => {
    if (specialistInfo) {
      return `${specialistInfo.firstName} ${specialistInfo.lastName}`.trim();
    }
    if (profile?.veterinarian?.firstName) {
      return `Dr. ${profile.veterinarian.firstName} ${profile.veterinarian.lastName}`;
    }
    if (profile?.serviceProvider?.firstName) {
      return `${profile.serviceProvider.firstName} ${profile.serviceProvider.lastName}`;
    }
    return profile?.user?.email?.split('@')[0] || 'Specialist';
  };

  const getAvatarUrl = () => {
    return specialistInfo?.avatarUrl || 
           profile?.veterinarian?.avatarUrl || 
           profile?.serviceProvider?.avatarUrl || 
           null;
  };

  const getSpecialistTypeLabel = () => {
    if (specialistInfo?.specialistType === 'VET') return 'Veterinarian';
    if (specialistInfo?.specialistType === 'SERVICE') return 'Service Provider';
    if (profile?.veterinarian) return 'Veterinarian';
    if (profile?.serviceProvider) return 'Service Provider';
    return 'Specialist';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not set';
    try {
      return format(new Date(dateString), 'd MMMM', { locale: ru });
    } catch {
      return 'Date not set';
    }
  };

  const navigateToAppointment = (appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  };

  const navigateToProfile = () => {
    router.push({ pathname: '/specialist-profile' });
  };

  const navigateToAllAppointments = () => {
    router.push({ pathname: '/specialist_appointments' });
  };

  const handleConfirmAppointment = async (id: number) => {
    try {
      await appointmentApi.confirmAppointment(id);
      Alert.alert('Success', 'Appointment confirmed');
      await loadAppointments();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to confirm appointment');
    }
  };

  const handleCancelBySpecialist = async (id: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentApi.cancelAppointment(id, 'Cancelled by specialist');
              Alert.alert('Success', 'Appointment cancelled');
              await loadAppointments();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const statusColors: Record<string, string> = {
    CREATED: '#FF9800',
    CONFIRMED: '#2196F3',
    COMPLETED: '#10B981',
    CANCELLED_BY_USER: '#DC2626',
    CANCELLED_BY_SPECIALIST: '#DC2626',
    NO_SHOW: '#6B7280',
  };

  const statusLabels: Record<string, string> = {
    CREATED: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED_BY_USER: 'Cancelled by Client',
    CANCELLED_BY_SPECIALIST: 'Cancelled by You',
    NO_SHOW: 'No Show',
  };

  const statusIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    CREATED: 'time-outline',
    CONFIRMED: 'checkmark-circle-outline',
    COMPLETED: 'checkmark-done-circle-outline',
    CANCELLED_BY_USER: 'close-circle-outline',
    CANCELLED_BY_SPECIALIST: 'close-circle-outline',
    NO_SHOW: 'person-remove-outline',
  };

  const renderAppointmentCard = ({ item }: { item: DisplayAppointment }) => {
    const statusColor = statusColors[item.status] || colors.text.secondary;
    const statusIcon = statusIcons[item.status as keyof typeof statusIcons] || 'calendar-outline';
    const isCreated = item.status === 'CREATED';
    const isConfirmed = item.status === 'CONFIRMED';

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card?.default || colors.background.secondary,
          borderRadius: 24,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.border?.light || '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header with name and status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary, fontSize: 16 }]}>
              {item.displayPetOwnerName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Ionicons name="paw-outline" size={14} color={colors.primary.main} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {item.displayPetName}
              </Text>
            </View>
          </View>
          
          <View
            style={{
              backgroundColor: statusColor + '15',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: statusColor + '30',
            }}
          >
            <Ionicons name={statusIcon} size={12} color={statusColor} />
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
              {statusLabels[item.status] || item.status}
            </Text>
          </View>
        </View>

        {/* Date and time */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background.tertiary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary.main} />
            <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 12 }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background.tertiary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
            <Ionicons name="time-outline" size={14} color={colors.primary.main} />
            <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 12 }]}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        {(isCreated || isConfirmed) && (
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            {isCreated && (
              <TouchableOpacity
                onPress={() => handleConfirmAppointment(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: '#10B981',
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-outline" size={18} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Confirm</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => navigateToAppointment(item.id)}
              style={{
                flex: isCreated ? 1 : 2,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: colors.background.tertiary,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border?.light || '#E5E7EB',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="eye-outline" size={18} color={colors.text.secondary} />
              <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '500' }}>Details</Text>
            </TouchableOpacity>
            
            {isCreated && (
              <TouchableOpacity
                onPress={() => handleCancelBySpecialist(item.id)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  backgroundColor: '#DC2626',
                  borderRadius: 16,
                }}
              >
                <Ionicons name="close-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {!isCreated && !isConfirmed && item.status !== 'COMPLETED' && (
          <TouchableOpacity
            onPress={() => navigateToAppointment(item.id)}
            style={{
              marginTop: spacing.md,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: colors.background.tertiary,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border?.light || '#E5E7EB',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="information-circle-outline" size={18} color={colors.text.secondary} />
            <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '500' }}>View Details</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <View style={{ backgroundColor: colors.background.tertiary, padding: 24, borderRadius: 60, marginBottom: 24 }}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.primary.main} />
          </View>
          <Text style={[typography.h4, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]}>
            Authentication Required
          </Text>
          <Text style={[typography.body2, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm }]}>
            Please log in to continue
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.md }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=E3275B&color=fff`;
  const avatarUrl = getAvatarUrl();
  const greeting = getGreeting();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
      }}>
        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 14 }]}>
            {greeting} 👋
          </Text>
          <Text style={[typography.h4, { color: colors.text.primary, fontWeight: '700', marginTop: 2 }]}>
            {getDisplayName()}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
            <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 12 }]}>
              {getSpecialistTypeLabel()}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            style={{ 
              width: 42, 
              height: 42, 
              borderRadius: 21, 
              backgroundColor: colors.background.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="bell" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={navigateToProfile}>
            <Image
              source={{ uri: avatarUrl || fallbackAvatar }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: colors.primary.main,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        <View style={{ padding: spacing.md, paddingTop: 0 }}>


          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <TouchableOpacity
              onPress={() => router.push('/specialist_appointments?status=CREATED')}
              style={{
                flex: 1,
                backgroundColor: colors.card?.default || colors.background.secondary,
                borderRadius: 24,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border?.light || '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary.main + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="time-outline" size={24} color={colors.primary.main} />
                </View>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary.main }}>
                  {createdCount}
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 13 }]}>
                Pending Appointments
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/specialist_appointments?status=COMPLETED')}
              style={{
                flex: 1,
                backgroundColor: colors.card?.default || colors.background.secondary,
                borderRadius: 24,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border?.light || '#E5E7EB',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B98115', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="checkmark-done-circle-outline" size={24} color="#10B981" />
                </View>
                <Text style={{ fontSize: 32, fontWeight: '700', color: '#10B981' }}>
                  {completedCount}
                </Text>
              </View>
              <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 13 }]}>
                Completed Visits
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
            <TouchableOpacity
              onPress={navigateToProfile}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colors.primary.main,
                paddingVertical: 14,
                borderRadius: 20,
                ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 } : { elevation: 4 }),
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>Manage Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={navigateToAllAppointments}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colors.card?.default || colors.background.secondary,
                paddingVertical: 14,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border?.light || '#E5E7EB',
              }}
            >
              <Ionicons name="list-outline" size={20} color={colors.primary.main} />
              <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '500' }}>All Appointments</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Appointments Section */}
          <View style={{ marginBottom: spacing.xl }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: spacing.md,
              paddingHorizontal: 4,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar-clear-outline" size={22} color={colors.primary.main} />
                <Text style={[typography.h4, { color: colors.text.primary, fontWeight: '600' }]}>
                  Recent Appointments
                </Text>
              </View>
              <TouchableOpacity 
                onPress={navigateToAllAppointments}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 4,
                  backgroundColor: colors.background.tertiary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: colors.primary.main, fontSize: 13, fontWeight: '500' }}>See All</Text>
                <Ionicons name="arrow-forward-outline" size={14} color={colors.primary.main} />
              </TouchableOpacity>
            </View>

            {appointments.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.card?.default || colors.background.secondary,
                  borderRadius: 24,
                  padding: spacing.xl,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border?.light || '#E5E7EB',
                }}
              >
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
                  <Ionicons name="calendar-outline" size={40} color={colors.text.tertiary} />
                </View>
                <Text style={[typography.body1, { color: colors.text.primary, marginBottom: 4 }]}>
                  No Appointments
                </Text>
                <Text style={[typography.caption, { color: colors.text.tertiary, textAlign: 'center' }]}>
                  New appointments will appear here
                </Text>
              </View>
            ) : (
              <FlatList
                data={appointments.slice(0, 5)}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAppointmentCard}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}