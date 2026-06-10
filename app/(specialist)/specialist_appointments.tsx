
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSpecialistAppointments } from '@/hooks/useAppointments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppointmentStatus } from '@/types/appointment.types';

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: '#FF9800',
  CONFIRMED: '#2196F3',
  COMPLETED: '#10B981',
  CANCELLED_BY_USER: '#DC2626',
  CANCELLED_BY_SPECIALIST: '#DC2626',
  NO_SHOW: '#8A8A8A',
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED_BY_USER: 'Cancelled by Client',
  CANCELLED_BY_SPECIALIST: 'Cancelled by You',
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

export default function SpecialistAppointmentsScreen() {
  const { colors, typography, spacing, shadows } = useTheme();
  const router = useRouter();
  
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | undefined>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [recommendations, setRecommendations] = useState('');

  const {
    appointments = [],
    loading,
    refreshing,
    createdCount = 0,
    refresh,
    confirmAppointment,
    cancelBySpecialist,
    completeAppointment,
    markAsNoShow,
    addRecommendations,
  } = useSpecialistAppointments({ status: filterStatus });

  const navigateToAppointment = useCallback((appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  }, [router]);

  const handleConfirm = useCallback((id: number) => {
    if (!confirmAppointment) {
      Alert.alert('Error', 'Confirm function unavailable');
      return;
    }
    Alert.alert('Confirm', 'Confirm this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => confirmAppointment(id) },
    ]);
  }, [confirmAppointment]);

  const handleCancel = useCallback(async () => {
    if (!cancelBySpecialist) {
      Alert.alert('Error', 'Cancel function unavailable');
      return;
    }
    
    if (selectedAppointment && cancelReason.trim()) {
      try {
        await cancelBySpecialist(selectedAppointment.id, cancelReason);
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedAppointment(null);
        Alert.alert('Success', 'Appointment cancelled');
      } catch (error) {
        Alert.alert('Error', 'Failed to cancel appointment');
      }
    } else {
      Alert.alert('Error', 'Please provide a cancellation reason');
    }
  }, [cancelBySpecialist, selectedAppointment, cancelReason]);

  const handleComplete = useCallback((id: number) => {
    if (!completeAppointment) {
      Alert.alert('Error', 'Complete function unavailable');
      return;
    }
    Alert.alert('Complete', 'Complete this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => completeAppointment(id) },
    ]);
  }, [completeAppointment]);

  const handleNoShow = useCallback((id: number) => {
    if (!markAsNoShow) {
      Alert.alert('Error', 'No-show function unavailable');
      return;
    }
    Alert.alert('No Show', 'Mark as no-show?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => markAsNoShow(id) },
    ]);
  }, [markAsNoShow]);

  const handleAddRecommendations = useCallback(async () => {
    if (!addRecommendations) {
      Alert.alert('Error', 'Recommendations function unavailable');
      return;
    }
    
    if (selectedAppointment && recommendations.trim()) {
      try {
        await addRecommendations(selectedAppointment.id, { recommendations });
        setShowRecommendationsModal(false);
        setRecommendations('');
        setSelectedAppointment(null);
        Alert.alert('Success', 'Recommendations added');
      } catch (error) {
        Alert.alert('Error', 'Failed to add recommendations');
      }
    } else {
      Alert.alert('Error', 'Please enter recommendations');
    }
  }, [addRecommendations, selectedAppointment, recommendations]);

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

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const renderStatusFilter = () => {
    const filterButtons = [
      { key: undefined as AppointmentStatus | undefined, label: 'All', icon: 'apps-outline' },
      { key: 'CREATED' as AppointmentStatus, label: 'Pending', icon: 'time-outline', badge: createdCount },
      { key: 'CONFIRMED' as AppointmentStatus, label: 'Confirmed', icon: 'checkmark-circle-outline' },
      { key: 'COMPLETED' as AppointmentStatus, label: 'Completed', icon: 'checkmark-done-circle-outline' },
      { key: 'CANCELLED_BY_USER' as AppointmentStatus, label: 'Cancelled', icon: 'close-circle-outline' },
      { key: 'NO_SHOW' as AppointmentStatus, label: 'No Show', icon: 'person-remove-outline' },
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
        {filterButtons.map((button) => {
          const isActive = filterStatus === button.key;
          const hasBadge = button.badge && button.badge > 0;
          
          return (
            <TouchableOpacity
              key={button.key === undefined ? 'all' : button.key}
              onPress={() => setFilterStatus(button.key)}
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
                position: 'relative',
              }}
            >
              <Ionicons 
                name={button.icon as any} 
                size={16} 
                color={isActive ? colors.text.inverse : colors.text.secondary} 
              />
              <Text style={{
                color: isActive ? colors.text.inverse : colors.text.primary,
                fontWeight: isActive ? '600' : '500',
                fontSize: 13,
              }}>
                {button.label}
              </Text>
              
              {hasBadge && !isActive && (
  <View style={{
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error?.main || '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.primary,
  }}>
    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>
      {button.badge > 99 ? '99+' : String(button.badge)}
    </Text>
  </View>
)}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderAppointmentCard = ({ item }: { item: any }) => {
    const statusColor = statusColors[item.status as AppointmentStatus] || colors.text.secondary;
    const statusIcon = statusIcons[item.status as AppointmentStatus] || 'calendar-outline';
    const isCreated = item.status === 'CREATED';
    const isConfirmed = item.status === 'CONFIRMED';
    const isCompleted = item.status === 'COMPLETED';

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card?.default || colors.background.secondary,
          borderRadius: 20,
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
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: spacing.xs 
        }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary, fontSize: 16 }]}>
              {item.petOwnerName || 'Client'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Ionicons name="paw-outline" size={14} color={colors.primary.main} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {item.petName || 'Pet'} {item.petType ? `(${item.petType})` : ''}
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
              {item.ownerNotes}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          {isCreated && (
            <>
              <TouchableOpacity
                onPress={() => handleConfirm(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: '#10B981',
                  borderRadius: 14,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-outline" size={16} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedAppointment(item);
                  setShowCancelModal(true);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  backgroundColor: '#DC2626',
                  borderRadius: 14,
                }}
              >
                <Ionicons name="close-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            </>
          )}

          {isConfirmed && (
            <>
              <TouchableOpacity
                onPress={() => handleComplete(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: '#10B981',
                  borderRadius: 14,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="checkmark-done-outline" size={16} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleNoShow(item.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: '#F59E0B',
                  borderRadius: 14,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Ionicons name="person-remove-outline" size={16} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>No Show</Text>
              </TouchableOpacity>
            </>
          )}

          {isCompleted && addRecommendations && (
            <TouchableOpacity
              onPress={() => {
                setSelectedAppointment(item);
                setShowRecommendationsModal(true);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: colors.primary.main,
                borderRadius: 14,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="document-text-outline" size={16} color="#FFF" />
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '600' }}>Add Recommendations</Text>
            </TouchableOpacity>
          )}

          {!isCreated && !isConfirmed && !isCompleted && (
            <TouchableOpacity
              onPress={() => navigateToAppointment(item.id)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                backgroundColor: colors.background.tertiary,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border?.light || '#E5E7EB',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary.main} />
              <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '500' }}>View Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && appointments.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </SafeAreaView>
    );
  }

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
              Appointments
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
              Manage all your appointments
            </Text>
          </View>
        </View>
        
        {createdCount > 0 && (
          <View
            style={{
              marginTop: spacing.md,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              backgroundColor: colors.primary.main + '15',
              borderRadius: 20,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="time-outline" size={14} color={colors.primary.main} />
            <Text style={{ color: colors.primary.main, fontSize: 13, fontWeight: '600' }}>
              {createdCount} pending {createdCount === 1 ? 'appointment' : 'appointments'}
            </Text>
          </View>
        )}
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
        ListEmptyComponent={
          showEmpty ? (
            <View style={{ 
              padding: spacing.xl, 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginTop: 60 
            }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.background.tertiary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={48}
                  color={colors.text.tertiary}
                />
              </View>
              <Text
                style={[
                  typography.h4,
                  {
                    color: colors.text.primary,
                    marginTop: spacing.md,
                  },
                ]}
              >
                No Appointments
              </Text>
              <Text
                style={[
                  typography.body2,
                  {
                    color: colors.text.secondary,
                    textAlign: 'center',
                    marginTop: spacing.xs,
                  },
                ]}
              >
                New appointments will appear here
              </Text>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.card?.default || colors.background.secondary, 
            borderRadius: 28, 
            padding: spacing.lg, 
            width: '85%',
            ...shadows?.modal,
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
                padding: spacing.sm,
                minHeight: 100,
                textAlignVertical: 'top',
                backgroundColor: colors.background.tertiary,
                color: colors.text.primary,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity 
                onPress={() => setShowCancelModal(false)}
                style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
              >
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCancel}
                style={{ 
                  paddingVertical: spacing.sm, 
                  paddingHorizontal: spacing.md,
                  backgroundColor: '#DC2626',
                  borderRadius: 14,
                }}
              >
                <Text style={[typography.body1SemiBold, { color: '#FFF' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Recommendations Modal */}
      <Modal 
        visible={showRecommendationsModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowRecommendationsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ 
            backgroundColor: colors.card?.default || colors.background.secondary, 
            borderRadius: 28, 
            padding: spacing.lg, 
            width: '85%',
            ...shadows?.modal,
          }}>
            <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primary.main + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
              }}>
                <Ionicons name="document-text-outline" size={28} color={colors.primary.main} />
              </View>
              <Text style={[typography.h4, { color: colors.text.primary }]}>
                Add Recommendations
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: 4 }]}>
                Share medical advice with the pet owner
              </Text>
            </View>
            <TextInput
              value={recommendations}
              onChangeText={setRecommendations}
              placeholder="Enter recommendations for the pet owner..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              style={{
                borderWidth: 1,
                borderColor: colors.border?.medium || '#E5E7EB',
                borderRadius: 16,
                padding: spacing.sm,
                minHeight: 140,
                textAlignVertical: 'top',
                backgroundColor: colors.background.tertiary,
                color: colors.text.primary,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.sm }}>
              <TouchableOpacity 
                onPress={() => setShowRecommendationsModal(false)}
                style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
              >
                <Text style={[typography.body1, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddRecommendations}
                style={{ 
                  paddingVertical: spacing.sm, 
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.primary.main,
                  borderRadius: 14,
                }}
              >
                <Text style={[typography.body1SemiBold, { color: '#FFF' }]}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}