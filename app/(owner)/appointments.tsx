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
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useOwnerAppointments } from '@/hooks/useAppointments';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppointmentStatus } from '@/types/appointment.types';
import '@/app/i18n';
import { useTranslation } from 'react-i18next';

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: '#FF9800',
  CONFIRMED: '#2196F3',
  COMPLETED: '#4CAF50',
  CANCELLED_BY_USER: '#F44336',
  CANCELLED_BY_SPECIALIST: '#F44336',
  NO_SHOW: '#9E9E9E',
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED_BY_USER: 'Cancelled',
  CANCELLED_BY_SPECIALIST: 'Cancelled by Specialist',
  NO_SHOW: 'No Show',
};

export default function MyAppointmentsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | undefined>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
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
      Alert.alert(t('appointment.Error'), t('appointment.CancelFunctionNotAvailable'));
      return;
    }

    if (!selectedAppointmentId) {
      Alert.alert(t('appointment.Error'), t('appointment.SelectAppointmentToCancel'));
      return;
    }

    if (!cancelReason.trim()) {
      Alert.alert(t('appointment.Error'), t('appointment.EnterCancelReason'));
      return;
    }

    try {
      await cancelAppointment(selectedAppointmentId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error('Cancel error:', error);
      Alert.alert(t('appointment.Error'), t('appointment.CancelFunctionNotAvailable'));
    }
  }, [cancelAppointment, selectedAppointmentId, cancelReason]);

  const openCancelModal = useCallback((appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setShowCancelModal(true);
  }, []);

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('appointment.noDate');
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return t('appointment.noDate');
    }
  };

  const navigateToAppointment = useCallback((appointmentId: number) => {
    router.push({
      pathname: '/appointment-details',
      params: { id: appointmentId.toString() }
    });
  }, [router]);

  const renderStatusFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 12, marginBottom: spacing.md, paddingVertical: 4 }}
    >
      <TouchableOpacity
        onPress={() => setSelectedStatus(undefined)}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 18,
          borderRadius: 999,
          backgroundColor: !selectedStatus ? colors.primary.main : colors.background.tertiary,
          ...(!selectedStatus && {
            shadowColor: colors.primary.main,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 3,
          }),
        }}
      >
        <Text style={{ 
          color: !selectedStatus ? colors.text.inverse : colors.text.primary,
          fontWeight: !selectedStatus ? '600' : '400',
        }}>
          {t('appointment.all')}
        </Text>
      </TouchableOpacity>
      {Object.entries(statusLabels).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          onPress={() => setSelectedStatus(key as AppointmentStatus)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 999,
            backgroundColor: selectedStatus === key ? colors.primary.main : colors.background.tertiary,
            ...(selectedStatus === key && {
              shadowColor: colors.primary.main,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3,
            }),
          }}
        >
          <Text style={{ 
            color: selectedStatus === key ? colors.text.inverse : colors.text.primary,
            fontWeight: selectedStatus === key ? '600' : '400',
          }}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderAppointmentCard = ({ item }: { item: any }) => {
    const canCancel = (item.status === t('appointment.CREATED') || item.status === t('appointment.CONFIRMED')) && cancelAppointment;
    const statusColor = statusColors[item.status as AppointmentStatus] || colors.text.secondary;
    
    return (
      <TouchableOpacity
        onPress={() => navigateToAppointment(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 24,
          padding: 20,
          marginBottom: 16,
          marginHorizontal: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: spacing.sm 
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons
              name="person-circle"
              size={48}
              color={colors.primary.main}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
                {item.specialistName || t('appointment.specialist')}
              </Text>
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {t('appointment.appointment')}
              </Text>
            </View>
          </View>
          
          <View
            style={{
              backgroundColor: statusColor + '20',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: spacing.sm,
            }}
          >
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: '500' }}>
              {statusLabels[item.status as AppointmentStatus] || item.status}
            </Text>
          </View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          gap: spacing.md, 
          marginBottom: spacing.md,
          marginTop: spacing.sm,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
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
            borderRadius: 999,
            marginTop: 4,
            marginBottom: spacing.xs,
          }}
        >
          <Text style={[typography.caption, { color: colors.text.primary }]}>
            🐾 {item.petName || t('appointment.noPetName')} {item.petType ? `(${item.petType})` : ''}
          </Text>
        </View>

        {item.ownerNotes && (
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs }]} numberOfLines={2}>
            {t('appointment.ownerNotes')}: {item.ownerNotes}
          </Text>
        )}

        {canCancel && (
          <TouchableOpacity
            onPress={() => openCancelModal(item.id)}
            style={{
              marginTop: spacing.md,
              paddingVertical: spacing.sm,
              alignItems: 'center',
              backgroundColor: (colors.error?.light || '#F44336') + '20',
              borderWidth: 1,
              borderColor: colors.error?.main || '#F44336',
              borderRadius: 12,
            }}
          >
            <Text style={{ 
              color: colors.error?.main || '#F44336', 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              {t('appointment.cancelappointment')}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const showFooter = loading && !refreshing;
  const showEmpty = !loading && !refreshing && appointments.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <View style={{
        paddingTop: 60,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        backgroundColor: colors.background.primary,
        borderBottomWidth: 0, 
      }}>
        <Text style={[typography.h2, { color: colors.text.primary }]}>
          {t('appointment.title')}
        </Text>
        
        <Text
          style={[
            typography.body2,
            {
              color: colors.text.secondary,
              marginTop: 4,
            },
          ]}
        >
          {t('appointment.subtitle')}
        </Text>
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
              <Ionicons name="calendar-clear-outline" size={80} color={colors.primary.light} />
              <Text style={[typography.h4, { color: colors.text.primary, marginTop: 16 }]}>
                {t('appointment.noAppointments')}
              </Text>
              <Text style={[typography.body2, { color: colors.text.secondary, textAlign: 'center', marginTop: 8 }]}>
                {t('appointment.noAppointmentsDescription')}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/')}
                style={{ 
                  marginTop: spacing.lg, 
                  backgroundColor: colors.primary.main, 
                  paddingHorizontal: spacing.lg, 
                  paddingVertical: spacing.sm, 
                  borderRadius: 999,
                  shadowColor: colors.primary.main,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>{t('appointment.bookAppointment')}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <Modal 
        visible={showCancelModal} 
        transparent 
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setShowCancelModal(false)}
        >
          <View style={{
            backgroundColor: colors.background.primary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          }}>
            <View
              style={{
                alignSelf: 'center',
                width: 50,
                height: 5,
                borderRadius: 999,
                backgroundColor: colors.border.medium,
                marginBottom: 20,
              }}
            />
            
            <Text style={[typography.h3, { color: colors.text.primary, marginBottom: 16 }]}>
              {t('appointment.cancelappointment')}
            </Text>
            
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder={t('appointment.cancelReasonPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              multiline
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 16,
                padding: spacing.md,
                minHeight: 100,
                textAlignVertical: 'top',
                backgroundColor: colors.background.secondary,
                color: colors.text.primary,
                fontSize: 16,
              }}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.lg, gap: spacing.md }}>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Text style={[typography.body1, { color: colors.text.secondary, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }]}>
                  {t('appointment.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCancel}
                style={{
                  backgroundColor: colors.error?.main || '#F44336',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: 12,
                }}
              >
                <Text style={[typography.body1SemiBold, { color: colors.text.inverse }]}>
                  {t('appointment.confirmCancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}