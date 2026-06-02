import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { scheduleApi } from '@/services/appointmentApi';
import type { SpecialistType, SpecialistScheduleCreateDto } from '@/services/appointmentApi';
import { useUser } from '@/hooks/useUser';

const daysOfWeek = [
  { value: 'MONDAY', label: 'Понедельник' },
  { value: 'TUESDAY', label: 'Вторник' },
  { value: 'WEDNESDAY', label: 'Среда' },
  { value: 'THURSDAY', label: 'Четверг' },
  { value: 'FRIDAY', label: 'Пятница' },
  { value: 'SATURDAY', label: 'Суббота' },
  { value: 'SUNDAY', label: 'Воскресенье' },
];

interface ScheduleFormProps {
  initialSpecialistId?: number;
  specialistType?: SpecialistType;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: SpecialistScheduleCreateDto; // Для редактирования
  isEdit?: boolean;
  scheduleId?: number;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  initialSpecialistId,
  specialistType = 'VET',
  onSuccess,
  onCancel,
  initialData,
  isEdit = false,
  scheduleId,
}) => {
  const { colors, typography, spacing } = useTheme();
  const { getCurrentUserId, isSpecialist, isAuthenticated } = useUser();
  const [loading, setLoading] = useState(false);
  
  // ✅ Функция для сравнения времени
  const compareTime = (t1: string, t2: string): number => {
    return t1.localeCompare(t2);
  };

  // ✅ Валидация формата времени
  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const getDefaultFormData = (): SpecialistScheduleCreateDto => ({
    specialistId: initialSpecialistId || getCurrentUserId(),
    specialistType: specialistType,
    dayOfWeek: 'MONDAY',
    workStart: '09:00',
    workEnd: '18:00',
    breakStart: null,
    breakEnd: null,
    slotDurationMinutes: 30,
  });

  const [formData, setFormData] = useState<SpecialistScheduleCreateDto>(getDefaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загрузка данных для редактирования
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Проверка прав доступа
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться');
      onCancel?.();
      return;
    }
    
    if (!isSpecialist()) {
      Alert.alert('Ошибка', 'Только специалисты могут создавать расписание');
      onCancel?.();
      return;
    }

    if (!initialSpecialistId && getCurrentUserId()) {
      setFormData(prev => ({
        ...prev,
        specialistId: getCurrentUserId()
      }));
    }
  }, [isAuthenticated, isSpecialist, getCurrentUserId, initialSpecialistId, onCancel]);

  // ✅ Улучшенная валидация
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.specialistId || formData.specialistId === 0) {
      newErrors.specialistId = 'ID специалиста обязателен';
    }
    
    if (!formData.workStart) {
      newErrors.workStart = 'Укажите время начала работы';
    } else if (!isValidTime(formData.workStart)) {
      newErrors.workStart = 'Неверный формат времени. Используйте HH:MM (например, 09:00)';
    }
    
    if (!formData.workEnd) {
      newErrors.workEnd = 'Укажите время окончания работы';
    } else if (!isValidTime(formData.workEnd)) {
      newErrors.workEnd = 'Неверный формат времени. Используйте HH:MM (например, 18:00)';
    }
    
    // ✅ Исправлено: сравнение времени с помощью функции
    if (formData.workStart && formData.workEnd && 
        isValidTime(formData.workStart) && isValidTime(formData.workEnd)) {
      if (compareTime(formData.workStart, formData.workEnd) >= 0) {
        newErrors.workEnd = 'Время окончания должно быть позже времени начала';
      }
    }
    
    if (!formData.slotDurationMinutes) {
      newErrors.slotDurationMinutes = 'Укажите длительность слота';
    } else if (formData.slotDurationMinutes < 15) {
      newErrors.slotDurationMinutes = 'Длительность слота должна быть не менее 15 минут';
    } else if (formData.slotDurationMinutes > 240) {
      newErrors.slotDurationMinutes = 'Длительность слота не может превышать 4 часа';
    }
    
    // Валидация перерыва
    if (formData.breakStart && formData.breakEnd) {
      if (!isValidTime(formData.breakStart)) {
        newErrors.breakStart = 'Неверный формат времени начала перерыва';
      }
      if (!isValidTime(formData.breakEnd)) {
        newErrors.breakEnd = 'Неверный формат времени окончания перерыва';
      }
      if (isValidTime(formData.breakStart) && isValidTime(formData.breakEnd)) {
        if (compareTime(formData.breakStart, formData.breakEnd) >= 0) {
          newErrors.breakEnd = 'Окончание перерыва должно быть позже начала';
        }
        // Проверка, что перерыв входит в рабочие часы
        if (formData.workStart && formData.workEnd && 
            isValidTime(formData.workStart) && isValidTime(formData.workEnd)) {
          if (compareTime(formData.breakStart, formData.workStart) < 0 ||
              compareTime(formData.breakEnd, formData.workEnd) > 0) {
            newErrors.breakEnd = 'Перерыв должен быть в пределах рабочего времени';
          }
        }
      }
    } else if (formData.breakStart && !formData.breakEnd) {
      newErrors.breakEnd = 'Укажите окончание перерыва';
    } else if (!formData.breakStart && formData.breakEnd) {
      newErrors.breakStart = 'Укажите начало перерыва';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (isEdit && scheduleId) {
        await scheduleApi.updateSchedule(scheduleId, formData);
        Alert.alert('Успех', 'Расписание успешно обновлено');
      } else {
        await scheduleApi.createSchedule(formData);
        Alert.alert('Успех', 'Расписание успешно создано');
      }
      
      // Сброс формы только при создании
      if (!isEdit) {
        setFormData({
          ...getDefaultFormData(),
          specialistId: initialSpecialistId || getCurrentUserId(),
          specialistType: specialistType,
        });
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      Alert.alert('Ошибка', error?.message || 'Не удалось сохранить расписание');
    } finally {
      setLoading(false);
    }
  };

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Text style={[typography.body1, { color: colors.text.primary, textAlign: 'center' }]}>
          Необходимо авторизоваться
        </Text>
        <TouchableOpacity 
          onPress={onCancel}
          style={{ 
            marginTop: spacing.md, 
            padding: spacing.md, 
            backgroundColor: colors.primary.main, 
            borderRadius: spacing.sm 
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isSpecialist()) {
    return (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Text style={[typography.body1, { color: colors.text.primary, textAlign: 'center' }]}>
          Только специалисты могут создавать расписание
        </Text>
        <TouchableOpacity 
          onPress={onCancel}
          style={{ 
            marginTop: spacing.md, 
            padding: spacing.md, 
            backgroundColor: colors.primary.main, 
            borderRadius: spacing.sm 
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, padding: spacing.md }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: spacing.md }]}>
        {isEdit ? 'Редактировать расписание' : 'Добавить расписание'}
      </Text>

      {/* ID специалиста - показываем только если не передан извне */}
      {!initialSpecialistId && (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
            ID специалиста *
          </Text>
          <TextInput
            value={formData.specialistId.toString()}
            editable={false}
            style={{
              borderWidth: 1,
              borderColor: errors.specialistId ? colors.error?.main || colors.primary.main : colors.border.light,
              borderRadius: spacing.sm,
              padding: spacing.sm,
              fontSize: 16,
              backgroundColor: colors.background.tertiary,
              color: colors.text.primary,
            }}
          />
          {errors.specialistId && (
            <Text style={{ color: colors.error?.main || colors.primary.main, fontSize: 12, marginTop: spacing.xs }}>
              {errors.specialistId}
            </Text>
          )}
        </View>
      )}

      {/* Тип специалиста (скрытое поле, только для информации) */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Тип специалиста
        </Text>
        <View style={{
          borderWidth: 1,
          borderColor: colors.border.light,
          borderRadius: spacing.sm,
          padding: spacing.sm,
          backgroundColor: colors.background.tertiary,
        }}>
          <Text style={{ color: colors.text.primary }}>
            {formData.specialistType === 'VET' ? 'Ветеринар' : 'Сервис (груминг, тренировки и т.д.)'}
          </Text>
        </View>
      </View>

      {/* День недели */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          День недели *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.value}
                onPress={() => setFormData({ ...formData, dayOfWeek: day.value as any })}
                style={{
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.md,
                  borderRadius: spacing.md,
                  backgroundColor: formData.dayOfWeek === day.value
                    ? colors.primary.main
                    : colors.background.tertiary,
                  borderWidth: 1,
                  borderColor: formData.dayOfWeek === day.value
                    ? colors.primary.main
                    : colors.border.light,
                }}
              >
                <Text style={{
                  color: formData.dayOfWeek === day.value
                    ? colors.text.inverse
                    : colors.text.primary,
                }}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Время начала */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Начало работы *
        </Text>
        <TextInput
          value={formData.workStart}
          onChangeText={(text) => setFormData({ ...formData, workStart: text })}
          placeholder="09:00"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numbers-and-punctuation"
          style={{
            borderWidth: 1,
            borderColor: errors.workStart ? colors.error?.main || colors.primary.main : colors.border.light,
            borderRadius: spacing.sm,
            padding: spacing.sm,
            fontSize: 16,
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
          }}
        />
        {errors.workStart && (
          <Text style={{ color: colors.error?.main || colors.primary.main, fontSize: 12, marginTop: spacing.xs }}>
            {errors.workStart}
          </Text>
        )}
      </View>

      {/* Время окончания */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Окончание работы *
        </Text>
        <TextInput
          value={formData.workEnd}
          onChangeText={(text) => setFormData({ ...formData, workEnd: text })}
          placeholder="18:00"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numbers-and-punctuation"
          style={{
            borderWidth: 1,
            borderColor: errors.workEnd ? colors.error?.main || colors.primary.main : colors.border.light,
            borderRadius: spacing.sm,
            padding: spacing.sm,
            fontSize: 16,
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
          }}
        />
        {errors.workEnd && (
          <Text style={{ color: colors.error?.main || colors.primary.main, fontSize: 12, marginTop: spacing.xs }}>
            {errors.workEnd}
          </Text>
        )}
      </View>

      {/* Длительность слота */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Длительность слота (минуты) *
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {[15, 30, 45, 60, 90, 120].map((duration) => (
            <TouchableOpacity
              key={duration}
              onPress={() => setFormData({ ...formData, slotDurationMinutes: duration })}
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.md,
                backgroundColor: formData.slotDurationMinutes === duration
                  ? colors.primary.main
                  : colors.background.tertiary,
                borderWidth: 1,
                borderColor: formData.slotDurationMinutes === duration
                  ? colors.primary.main
                  : colors.border.light,
              }}
            >
              <Text style={{
                color: formData.slotDurationMinutes === duration
                  ? colors.text.inverse
                  : colors.text.primary,
              }}>
                {duration} мин
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.slotDurationMinutes && (
          <Text style={{ color: colors.error?.main || colors.primary.main, fontSize: 12, marginTop: spacing.xs }}>
            {errors.slotDurationMinutes}
          </Text>
        )}
      </View>

      {/* Перерыв */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text style={[typography.body1, { color: colors.text.primary, marginBottom: spacing.xs }]}>
          Перерыв (опционально)
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.xs }]}>
              Начало
            </Text>
            <TextInput
              value={formData.breakStart || ''}
              onChangeText={(text) => setFormData({ ...formData, breakStart: text || null })}
              placeholder="13:00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numbers-and-punctuation"
              style={{
                borderWidth: 1,
                borderColor: errors.breakStart ? colors.error?.main || colors.primary.main : colors.border.light,
                borderRadius: spacing.sm,
                padding: spacing.sm,
                fontSize: 16,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
            {errors.breakStart && (
              <Text style={{ color: colors.error?.main || colors.primary.main, fontSize: 12, marginTop: spacing.xs }}>
                {errors.breakStart}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.xs }]}>
              Окончание
            </Text>
            <TextInput
              value={formData.breakEnd || ''}
              onChangeText={(text) => setFormData({ ...formData, breakEnd: text || null })}
              placeholder="14:00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numbers-and-punctuation"
              style={{
                borderWidth: 1,
                borderColor: errors.breakEnd ? colors.error?.main || colors.primary.main : colors.border.light,
                borderRadius: spacing.sm,
                padding: spacing.sm,
                fontSize: 16,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
            {errors.breakEnd && (
              <Text style={{ color: colors.error?.main || colors.primary.main, fontSize: 12, marginTop: spacing.xs }}>
                {errors.breakEnd}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Кнопки */}
      <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl }}>
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={{
              flex: 1,
              backgroundColor: colors.background.tertiary,
              padding: spacing.md,
              borderRadius: spacing.sm,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Text style={[typography.button, { color: colors.text.primary }]}>
              Отмена
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: colors.primary.main,
            padding: spacing.md,
            borderRadius: spacing.sm,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={[typography.button, { color: colors.text.inverse }]}>
              {isEdit ? 'Обновить расписание' : 'Сохранить расписание'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};