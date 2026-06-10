// components/slots/SlotManagement.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { timeSlotApi, specialistService } from '@/services/appointmentApi';
import type { TimeSlot } from '@/services/appointmentApi';
import "@/app/i18n";
import { useTranslation } from "react-i18next";


interface SlotManagementProps {
  userId: number;
  specialistType?: 'VET' | 'SERVICE';
  isOwner?: boolean;
}

export const SlotManagement: React.FC<SlotManagementProps> = ({
  userId,
  specialistType: propSpecialistType,
  isOwner = false,
}) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [specialistInfo, setSpecialistInfo] = useState<{ specialistId: number; specialistType: string } | null>(null);
  const [loadingSpecialist, setLoadingSpecialist] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadSpecialistInfo();
    

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (specialistInfo) {
      loadSlots();
    }
    
 
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [selectedDate, specialistInfo]);

  const loadSpecialistInfo = async () => {
    try {
      setLoadingSpecialist(true);
      const info = await specialistService.getSpecialistByUserId(userId);
      setSpecialistInfo({
        specialistId: info.specialistId,
        specialistType: info.specialistType,
      });
    } catch (error) {
      console.error('Error loading specialist info:', error);
      Alert.alert(
        t('slots.error'),
        t('slots.specialistNotFoundDescription')
      );
    } finally {
      setLoadingSpecialist(false);
    }
  };

  const loadSlots = async () => {
    if (!specialistInfo) return;
    

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const slotsData = await timeSlotApi.getSlotsByDate(
        specialistInfo.specialistId,
        specialistInfo.specialistType as 'VET' | 'SERVICE',
        formattedDate
      );
      

      const sortedSlots = (slotsData || []).sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );
      
      setSlots(sortedSlots);
    } catch (error: any) {

      if (error?.name === 'AbortError' || error?.message === 'canceled') {
        return;
      }
      
      console.error('Error loading slots:', error);
      
      try {
  const formattedDate = selectedDate.toISOString().split('T')[0];
  const result = await timeSlotApi.getAvailableSlotsByUserId(userId, formattedDate);
  const sortedSlots = (result.slots?.content || []).sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
  setSlots(sortedSlots);
} catch (fallbackError: any) {
  if (fallbackError?.name !== 'AbortError') {
    console.error('Fallback error:', fallbackError);
  }
}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedSlot || !blockReason.trim()) {
      Alert.alert(t('slots.error'), t('slots.blockReasonRequired'));
      return;
    }
    
    try {
      await timeSlotApi.blockSlot(selectedSlot.id, blockReason);
      await loadSlots();
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedSlot(null);
      Alert.alert(t('slots.success'), t('slots.slotBlocked'));
    } catch (error: any) {
      console.error('Error blocking slot:', error);
      Alert.alert(t('slots.error'), error?.message || t('slots.blockFailed'));
    }
  };

  const handleUnblockSlot = async (slotId: number) => {
    Alert.alert(
      t('slots.confirmation'),
      t('slots.unblockQuestion'),
      [
        { text: t('slots.cancel'), style: 'cancel' },
        {
          text: t('slots.unblock'),
          onPress: async () => {
            try {
              await timeSlotApi.unblockSlot(slotId);
              await loadSlots();
              Alert.alert(t('slots.success'), t('slots.slotUnblocked'));
            } catch (error: any) {
              console.error('Error unblocking slot:', error);
              Alert.alert(t('slots.error'), error?.message || t('slots.unblockFailed'));
            }
          },
        },
      ]
    );
  };

  const handleRegenerateSlots = async () => {
    if (!specialistInfo) return;
    

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      Alert.alert(t('slots.error'), t('slots.cannotGeneratePast'));
      return;
    }
    
    Alert.alert(
      t('slots.confirmation'),
      t('slots.regenerateQuestion'),
      [
        { text: t('slots.cancel'), style: 'cancel' },
        {
          text: t('slots.continue'),
          onPress: async () => {
            try {
              setRegenerating(true);
              const formattedDate = selectedDate.toISOString().split('T')[0];
              
              await timeSlotApi.regenerateSlotsByUserId(userId, formattedDate);
              await loadSlots();
              Alert.alert(t('slots.success'), t('slots.slotsGenerated'));
            } catch (error: any) {
              console.error('Error regenerating slots:', error);
              Alert.alert(t('slots.error'), error?.message || t('slots.generateFailed'));
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadSlots();
  }, [selectedDate, specialistInfo]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getSlotStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '#4CAF50'; 
      case 'BOOKED':
        return '#F44336';
      case 'BLOCKED':
        return '#FF9800';
      default:
        return colors.text.secondary;
    }
  };

  const getSlotStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return t('slots.available');
      case 'BOOKED':
        return t('slots.booked');
      case 'BLOCKED':
        return t('slots.blocked');
      default:
        return status;
    }
  };


  const isSlotPast = (slot: TimeSlot) => {
    const [hours, minutes] = slot.startTime.split(':');
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return slotDateTime < new Date();
  };

  if (loadingSpecialist) {
    return (
      <View style={{ padding: spacing.xl, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={[typography.body2, { color: colors.text.secondary, marginTop: spacing.md }]}>
          {t('slots.loadingSpecialist')}
        </Text>
      </View>
    );
  }

  if (!specialistInfo) {
    return (
      <View style={{ 
        padding: spacing.xl, 
        alignItems: 'center', 
        backgroundColor: colors.background.tertiary, 
        borderRadius: spacing.md 
      }}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md, textAlign: 'center' }]}>
          {t("slots.specialistNotFound")}
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.xs, textAlign: 'center' }]}>
          {t('slots.specialistNotFoundDescription')}
        </Text>
      </View>
    );
  }

  return (
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
      <View style={{ padding: spacing.md }}>
     
        <View style={{ 
          backgroundColor: colors.card.default, 
          borderRadius: spacing.md, 
          padding: spacing.md, 
          marginBottom: spacing.md, 
          borderWidth: 1, 
          borderColor: colors.border.light 
        }}>
          <Text style={[typography.body2, { color: colors.text.secondary }]}>
            {t("slots.specialistType")} {specialistInfo.specialistType === 'VET' ? t('slots.veterinarian') : t('slots.serviceProvider')}
          </Text>
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs }]}>
            {t("slots.specialistId")} {specialistInfo.specialistId}
          </Text>
        </View>


        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: spacing.lg, 
          backgroundColor: colors.card.default, 
          borderRadius: spacing.md, 
          padding: spacing.md, 
          borderWidth: 1, 
          borderColor: colors.border.light 
        }}>
          <TouchableOpacity 
            onPress={() => changeDate(-1)} 
            style={{ padding: spacing.xs }}
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary.main} />
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
              {formatDate(selectedDate)}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => changeDate(1)} 
            style={{ padding: spacing.xs }}
            disabled={loading}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>


        {isOwner && (
          <TouchableOpacity
            onPress={handleRegenerateSlots}
            disabled={regenerating || loading}
            style={{ 
              backgroundColor: colors.primary.main, 
              padding: spacing.md, 
              borderRadius: spacing.sm, 
              alignItems: 'center', 
              marginBottom: spacing.md,
              opacity: (regenerating || loading) ? 0.7 : 1
            }}
          >
            {regenerating ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={[typography.button, { color: colors.text.inverse }]}>
                {t("slots.regenerateSlots")}
              </Text>
            )}
          </TouchableOpacity>
        )}


        {loading ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        ) : slots.length === 0 ? (
          <View style={{ 
            padding: spacing.xl, 
            alignItems: 'center', 
            backgroundColor: colors.background.tertiary, 
            borderRadius: spacing.md 
          }}>
            <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
            <Text style={[typography.body1, { color: colors.text.primary, marginTop: spacing.md }]}>
              {t("slots.noSlots")}
            </Text>
            {isOwner && (
              <TouchableOpacity 
                onPress={handleRegenerateSlots} 
                style={{ marginTop: spacing.md }}
                disabled={regenerating}
              >
                <Text style={{ color: colors.primary.main }}>{t('slots.generateSlots')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
  {slots.map((slot) => {
    const isPast = isSlotPast(slot);
    const isBooked = slot.status === 'BOOKED';
    const isBlocked = slot.status === 'BLOCKED';
    const isAvailable = slot.status === 'AVAILABLE';
    
    return (
      <View 
        key={slot.id} 
        style={{ 
          backgroundColor: colors.card.default, 
          borderRadius: spacing.sm, 
          padding: spacing.sm, 
          minWidth: 100, 
          borderWidth: 1, 
          borderColor: colors.border.light,
          opacity: (isBooked || isPast) ? 0.6 : 1,
        }}
      >
        <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </Text>
        

        {isPast && !isBooked && (
          <View style={{ marginTop: spacing.xs }}>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>
              {t("slots.pastSlot")}
            </Text>
          </View>
        )}
        
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.xs }}>
          <View style={{ 
            width: 8, 
            height: 8, 
            borderRadius: 4, 
            backgroundColor: getSlotStatusColor(slot.status) 
          }} />
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {getSlotStatusText(slot.status)}
          </Text>
        </View>


        {isOwner && isAvailable && !isPast && (
          <TouchableOpacity 
            onPress={() => { 
              setSelectedSlot(slot); 
              setShowBlockModal(true); 
            }} 
            style={{ 
              marginTop: spacing.xs, 
              paddingVertical: spacing.xs, 
              alignItems: 'center', 
              backgroundColor: colors.primary.light + '20', 
              borderRadius: spacing.xs 
            }}
          >
        1      <Text style={{ color: colors.primary.main, fontSize: 12 }}>
              {t("slots.block")}
            </Text>
          </TouchableOpacity>
        )}


        {isOwner && isBlocked && !isPast && (
          <TouchableOpacity 
            onPress={() => handleUnblockSlot(slot.id)} 
            style={{ 
              marginTop: spacing.xs, 
              paddingVertical: spacing.xs, 
              alignItems: 'center', 
              backgroundColor: colors.primary.light + '20', 
              borderRadius: spacing.xs 
            }}
          >
            <Text style={{ color: colors.primary.main, fontSize: 12 }}>
              {t('slots.unblock')}
            </Text>
          </TouchableOpacity>
        )}
        

        {isPast && (isAvailable || isBlocked) && (
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs, textAlign: 'center' }]}>
            {t("slots.cannotEdit")}
          </Text>
        )}
      </View>
    );
  })}
</View>
        )}


        <Modal 
          visible={showBlockModal} 
          transparent 
          animationType="fade"
          onRequestClose={() => setShowBlockModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: colors.background.primary, 
              borderRadius: spacing.lg, 
              padding: spacing.lg, 
              width: '80%' 
            }}>
              <Text style={[typography.h4, { color: colors.text.primary, marginBottom: spacing.md }]}>
                {t("slots.blockReason")}
              </Text>
              
              <TextInput
                value={blockReason}
                onChangeText={setBlockReason}
                placeholder={t("slots.blockPlaceholder")}
                placeholderTextColor={colors.text.tertiary}
                multiline
                style={{ 
                  borderWidth: 1, 
                  borderColor: colors.border.light, 
                  borderRadius: spacing.sm, 
                  padding: spacing.sm, 
                  minHeight: 80, 
                  textAlignVertical: 'top', 
                  backgroundColor: colors.background.secondary, 
                  color: colors.text.primary 
                }}
              />
              
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'flex-end', 
                marginTop: spacing.lg, 
                gap: spacing.sm 
              }}>
                <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                  <Text style={[typography.body1, { color: colors.text.secondary }]}>
                    {t("slots.cancel")}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={handleBlockSlot}>
                  <Text style={[typography.body1SemiBold, { color: colors.primary.main }]}>
                    {t("slots.blocked")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};