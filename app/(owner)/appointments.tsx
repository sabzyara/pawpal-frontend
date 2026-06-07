// app/my_appointments.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useOwnerAppointments } from '@/hooks/useAppointments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppointmentStatus } from '@/types/appointment.types';

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: '#FF9800',
  CONFIRMED: '#2196F3',
  COMPLETED: '#10B981',
  CANCELLED_BY_USER: '#DC2626',
  CANCELLED_BY_SPECIALIST: '#DC2626',
  NO_SHOW: '#6B7280',
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED_BY_USER: 'Cancelled',
  CANCELLED_BY_SPECIALIST: 'Cancelled by Specialist',
  NO_SHOW: 'No Show',
};

const statusIcons: Record<AppointmentStatus, keyof typeof Ionicons.glyphMap> = {
  CREATED: 'time-outline',
  CONFIRMED: 'checkmark-circle-outline',
  COMPLETED: 'checkmark-done-circle-outline',
  CANCELLED_BY_USER: 'close-circle-outline',
  CANCELLED_BY_SPECIALIST: 'close-circle-outline',
  NO_SHOW: 'person-remove-outline',
};

export default function MyAppointmentsScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | undefined>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');

  const {
    appointments = [], 
    loading,
    refreshing,
    loadMore,
    refresh,
    cancelAppointment,
  } = useOwnerAppointments({ status: selectedStatus });

  const handleCancel = useCallback(async () => {
    if (!cancelAppointment) {
      Alert.alert('Error', 'Cancel function unavailable');
      return;
    }

    if (!selectedAppointment) {
      Alert.alert('Error', 'Select an appointment to cancel');
      return;
    }

    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a cancellation reason');
      return;
    }

    try {
      await cancelAppointment(selectedAppointment.id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      Alert.alert('Success', 'Appointment cancelled successfully');
    } catch (error) {
      console.error('Cancel error:', error);
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  }, [cancelAppointment, selectedAppointment, cancelReason]);

  const openCancelModal = useCallback((appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  }, []);

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Date not set';
    }
  };

  const navigateToAppointment = useCallback((appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  }, [router]);

  const renderStatusFilter = () => {
    const filters = [
      { key: undefined, label: 'All', icon: 'apps-outline' },
      { key: 'CREATED', label: 'Pending', icon: 'time-outline' },
      { key: 'CONFIRMED', label: 'Confirmed', icon: 'checkmark-circle-outline' },
      { key: 'COMPLETED', label: 'Completed', icon: 'checkmark-done-circle-outline' },
      { key: 'CANCELLED_BY_USER', label: 'Cancelled', icon: 'close-circle-outline' },
      { key: 'NO_SHOW', label: 'No Show', icon: 'person-remove-outline' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.md, 
          gap: spacing.sm, 
          marginBottom: spacing.md,
          paddingBottom: 4,
        }}
      >
        {filters.map((filter) => {
          const isActive = selectedStatus === filter.key;
          
          return (
            <TouchableOpacity
              key={filter.key || 'all'}
              onPress={() => setSelectedStatus(filter.key as AppointmentStatus)}
              style={{
                height: 40,
                paddingHorizontal: spacing.md,
                borderRadius: 20,
                backgroundColor: isActive ? colors.primary.main : colors.background.tertiary,
                borderWidth: 1,
                borderColor: isActive ? colors.primary.main : colors.border?.light || '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={isActive ? colors.text.inverse : colors.text.secondary} 
              />
              <Text style={{
                color: isActive ? colors.text.inverse : colors.text.primary,
                fontWeight: isActive ? '600' : '500',
                fontSize: 13,
              }}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderAppointmentCard = ({ item }: { item: any }) => {
    const canCancel = (item.status === 'CREATED' || item.status === 'CONFIRMED') && cancelAppointment;
    const statusColor = statusColors[item.status as AppointmentStatus] || colors.text.secondary;
    const statusIcon = statusIcons[item.status as AppointmentStatus] || 'calendar-outline';
    const isCancelled = item.status === 'CANCELLED_BY_USER' || item.status === 'CANCELLED_BY_SPECIALIST';
    
    return (
      <TouchableOpacity
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card?.default || colors.background.secondary,
          borderRadius: 24,
          padding: spacing.md,
          marginBottom: spacing.sm,
          marginHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: colors.border?.light || '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
          opacity: isCancelled ? 0.7 : 1,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: spacing.sm 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.primary.main + '15',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="medical-outline" size={24} color={colors.primary.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.body1SemiBold, { color: colors.text.primary, fontSize: 16 }]}>
                {item.specialistName || 'Specialist'}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
                Appointment
              </Text>
            </View>
          </View>
          
          <View
            style={{
              backgroundColor: statusColor + '15',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              borderWidth: 0.5,
              borderColor: statusColor + '30',
            }}
          >
            <Ionicons name={statusIcon} size={12} color={statusColor} />
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: '600' }}>
              {statusLabels[item.status as AppointmentStatus] || item.status}
            </Text>
          </View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.md, 
          marginBottom: spacing.md,
          marginTop: spacing.sm,
          flexWrap: 'wrap',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary.main} />
            <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 12 }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <Ionicons name="time-outline" size={14} color={colors.primary.main} />
            <Text style={[typography.caption, { color: colors.text.secondary, fontSize: 12 }]}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: colors.background.tertiary,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            marginTop: 4,
            marginBottom: spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="paw-outline" size={14} color={colors.primary.main} />
          <Text style={[typography.caption, { color: colors.text.primary, fontSize: 13 }]}>
            {item.petName || 'Pet not specified'} {item.petType ? `(${item.petType})` : ''}
          </Text>
        </View>

        {item.ownerNotes && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'flex-start', 
            gap: 6,
            marginTop: spacing.sm,
            paddingTop: spacing.xs,
            borderTopWidth: 1,
            borderTopColor: colors.border?.light || '#E5E7EB',
          }}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary, flex: 1 }]} numberOfLines={2}>
              Note: {item.ownerNotes}
            </Text>
          </View>
        )}

        {canCancel && (
          <TouchableOpacity
            onPress={() => openCancelModal(item)}
            style={{
              marginTop: spacing.md,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: '#DC262615',
              borderWidth: 1,
              borderColor: '#DC2626',
              borderRadius: 14,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
            <Text style={{ 
              color: '#DC2626', 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              Cancel Appointment
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const showFooter = loading && !refreshing;
  const showEmpty = !loading && !refreshing && appointments.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border?.light || '#E5E7EB',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.background.tertiary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View>
            <Text style={[typography.h3, { color: colors.text.primary, fontWeight: '700' }]}>
              My Appointments
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Manage your upcoming visits
            </Text>
          </View>
        </View>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={appointments}  
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointmentCard}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={refresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          showFooter ? (
            <View style={{ padding: spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          showEmpty ? (
            <View style={{ padding: spacing.xl, alignItems: 'center', paddingTop: 80 }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: colors.background.tertiary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}>
                <Ionicons name="calendar-clear-outline" size={56} color={colors.text.tertiary} />
              </View>
              <Text style={[typography.h4, { color: colors.text.primary, marginTop: 16 }]}>
                No Appointments
              </Text>
              <Text style={[typography.body2, { color: colors.text.secondary, textAlign: 'center', marginTop: 8, paddingHorizontal: spacing.lg }]}>
                Book an appointment with a veterinarian or specialist for your pet
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/')}
                style={{ 
                  marginTop: spacing.lg, 
                  backgroundColor: colors.primary.main, 
                  paddingHorizontal: spacing.lg, 
                  paddingVertical: spacing.sm, 
                  borderRadius: 30,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  shadowColor: colors.primary.main,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
                <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>Book Now</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={appointments.length === 0 ? { flex: 1 } : { paddingBottom: spacing.xl }}
      />

      {/* Cancel Modal */}
      <Modal 
        visible={showCancelModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <View style={{
            backgroundColor: colors.card?.default || colors.background.secondary,
            borderRadius: 28,
            padding: spacing.lg,
            width: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 5,
          }}>
            <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#DC262615',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
              }}>
                <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
              </View>
              <Text style={[typography.h4, { color: colors.text.primary }]}>
                Cancel Appointment
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                Please provide a reason for cancellation
              </Text>
            </View>
            
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Enter cancellation reason..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              style={{
                borderWidth: 1,
                borderColor: colors.border?.medium || '#E5E7EB',
                borderRadius: 16,
                padding: spacing.md,
                minHeight: 100,
                textAlignVertical: 'top',
                backgroundColor: colors.background.tertiary,
                color: colors.text.primary,
                fontSize: 14,
              }}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.md }}>
              <TouchableOpacity 
                onPress={() => setShowCancelModal(false)}
                style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
              >
                <Text style={[typography.body1, { color: colors.text.secondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCancel}
                style={{
                  backgroundColor: '#DC2626',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-outline" size={18} color="#FFF" />
                <Text style={[typography.body1SemiBold, { color: '#FFF' }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}