import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { SlotManagement } from '@/components/slots/SlotManagement';
import { useUser } from '@/hooks/useUser';

interface VetManageProps {
  specialistId: number;
  specialistType: 'VET' | 'SERVICE';
  onDelete: () => void;
}

type ManageTabType = 'schedule' | 'slots';

export const VetManage: React.FC<VetManageProps> = ({
  specialistId,
  specialistType,
  onDelete,
}) => {
  const { colors, typography, spacing } = useTheme();
  const { getCurrentUserId, isSpecialist } = useUser();
  const [activeTab, setActiveTab] = useState<ManageTabType>('schedule');
  const [deleting, setDeleting] = useState(false);

  
  const canManage = isSpecialist() && getCurrentUserId() === specialistId;

  const handleDelete = () => {
    Alert.alert(
      'Удаление профиля',
      'Вы уверены, что хотите удалить профиль специалиста? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete();
              Alert.alert('Успех', 'Профиль специалиста удален');
            } catch (error: any) {
              Alert.alert('Ошибка', error?.message || 'Не удалось удалить профиль');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Преобразуем строковый тип в enum для ScheduleForm
  const getSpecialistTypeEnum = (): 'VET' | 'SERVICE' => {
    return specialistType;
  };

  // Если нет прав доступа, показываем сообщение
  if (!canManage) {
    return (
      <View
        style={{
          padding: spacing.xl,
          alignItems: 'center',
          backgroundColor: colors.background.tertiary,
          borderRadius: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <Text style={[typography.body1, { color: colors.text.primary, textAlign: 'center' }]}>
          У вас нет прав для управления этим профилем
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs }]}>
          Только владелец профиля может управлять расписанием и слотами
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: spacing.md }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={() => setActiveTab('schedule')}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            alignItems: 'center',
            borderRadius: spacing.sm,
            backgroundColor: activeTab === 'schedule' 
              ? colors.primary.main 
              : colors.background.tertiary,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              {
                color: activeTab === 'schedule' 
                  ? colors.text.inverse 
                  : colors.text.primary,
              },
            ]}
          >
            Расписание
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('slots')}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            alignItems: 'center',
            borderRadius: spacing.sm,
            backgroundColor: activeTab === 'slots' 
              ? colors.primary.main 
              : colors.background.tertiary,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              {
                color: activeTab === 'slots' 
                  ? colors.text.inverse 
                  : colors.text.primary,
              },
            ]}
          >
            Слоты
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'schedule' && (
        <ScheduleForm 
          initialSpecialistId={specialistId}
          specialistType={getSpecialistTypeEnum()}
          onSuccess={() => {
            Alert.alert('Успех', 'Расписание сохранено');
          }}
        />
      )}
      
      {activeTab === 'slots' && (
        <SlotManagement 
          specialistId={specialistId} 
          specialistType={specialistType} 
        />
      )}

      {/* Кнопка удаления профиля */}
      <TouchableOpacity
        onPress={handleDelete}
        disabled={deleting}
        style={{
          backgroundColor: colors.error?.main || colors.primary.main, // Используем error цвет, если есть
          padding: spacing.md,
          borderRadius: spacing.sm,
          alignItems: 'center',
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
          opacity: deleting ? 0.7 : 1,
        }}
      >
        {deleting ? (
          <ActivityIndicator color={colors.text.inverse} />
        ) : (
          <Text style={[typography.button, { color: colors.text.inverse }]}>
            Удалить профиль
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};