// components/ScheduleForm.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { useAuthStore } from "@/store/authStore";
import { useUserRole } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import type {
  SpecialistScheduleCreateDto,
  SpecialistType,
} from "@/services/appointmentApi";
import { scheduleApi, specialistService } from "@/services/appointmentApi";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const daysOfWeek = [
  { value: "MONDAY", label: "Понедельник" },
  { value: "TUESDAY", label: "Вторник" },
  { value: "WEDNESDAY", label: "Среда" },
  { value: "THURSDAY", label: "Четверг" },
  { value: "FRIDAY", label: "Пятница" },
  { value: "SATURDAY", label: "Суббота" },
  { value: "SUNDAY", label: "Воскресенье" },
] as const;

type DayOfWeek = typeof daysOfWeek[number]["value"];

interface ScheduleFormProps {
  initialUserId?: number;
  specialistType?: SpecialistType;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: SpecialistScheduleCreateDto;
  isEdit?: boolean;
  scheduleId?: number;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialUserId,
  specialistType = "VET",
  onSuccess,
  onCancel,
  initialData,
  isEdit = false,
  scheduleId,
}) => {
  const { colors, typography, spacing } = useTheme();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const { isSpecialist } = useUserRole();

  const [loading, setLoading] = useState(false);
  const [loadingSpecialist, setLoadingSpecialist] = useState(false);
  const [initialFormData, setInitialFormData] = useState<SpecialistScheduleCreateDto | null>(null);

  const compareTime = (t1: string, t2: string): number => {
    return t1.localeCompare(t2);
  };

  const isValidTime = (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const getDefaultFormData = (): SpecialistScheduleCreateDto => ({
    specialistId: 0,
    specialistType: specialistType,
    dayOfWeek: "MONDAY",
    workStart: "09:00",
    workEnd: "18:00",
    breakStart: null,
    breakEnd: null,
    slotDurationMinutes: 30,
  });

  const [formData, setFormData] =
    useState<SpecialistScheduleCreateDto>(getDefaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Функция загрузки ID специалиста
  const loadSpecialistId = useCallback(async () => {
    const targetUserId = initialUserId || user?.id;

    if (!targetUserId) return;

    try {
      setLoadingSpecialist(true);
      const specialist = await specialistService.getSpecialistByUserId(targetUserId);

      console.log('✅ Found specialist:', {
        specialistId: specialist.specialistId,
        specialistType: specialist.specialistType,
        userId: specialist.userId
      });

      setFormData((prev) => ({
        ...prev,
        specialistId: specialist.specialistId,
        specialistType: specialist.specialistType,
      }));
    } catch (error) {
      console.error("Error loading specialist:", error);
      Alert.alert(
        "Ошибка",
        "Не удалось найти профиль специалиста. Убедитесь, что вы зарегистрированы как специалист."
      );
      onCancel?.();
    } finally {
      setLoadingSpecialist(false);
    }
  }, [initialUserId, user?.id, onCancel]);

  useEffect(() => {
    if (isAuthenticated && isSpecialist) {
      loadSpecialistId();
    }
  }, [isAuthenticated, isSpecialist, loadSpecialistId]);

  // Загрузка данных для редактирования
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setInitialFormData(initialData);
    }
  }, [initialData]);

  // Проверка прав доступа
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert("Ошибка", "Необходимо авторизоваться");
      onCancel?.();
      return;
    }

    if (!isSpecialist) {
      Alert.alert("Ошибка", "Только специалисты могут создавать расписание");
      onCancel?.();
      return;
    }
  }, [isAuthenticated, isSpecialist, onCancel]);

  // Проверка, были ли изменения
  const hasChanges = useCallback((): boolean => {
    if (!initialFormData && !isEdit) return false;
    if (isEdit && initialFormData) {
      return JSON.stringify({
        dayOfWeek: formData.dayOfWeek,
        workStart: formData.workStart,
        workEnd: formData.workEnd,
        breakStart: formData.breakStart,
        breakEnd: formData.breakEnd,
        slotDurationMinutes: formData.slotDurationMinutes,
      }) !== JSON.stringify({
        dayOfWeek: initialFormData.dayOfWeek,
        workStart: initialFormData.workStart,
        workEnd: initialFormData.workEnd,
        breakStart: initialFormData.breakStart,
        breakEnd: initialFormData.breakEnd,
        slotDurationMinutes: initialFormData.slotDurationMinutes,
      });
    }
    return true;
  }, [formData, initialFormData, isEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.specialistId || formData.specialistId === 0) {
      newErrors.specialistId = "ID специалиста обязателен";
    }

    if (!formData.workStart) {
      newErrors.workStart = "Укажите время начала работы";
    } else if (!isValidTime(formData.workStart)) {
      newErrors.workStart =
        "Неверный формат времени. Используйте HH:MM (например, 09:00)";
    }

    if (!formData.workEnd) {
      newErrors.workEnd = "Укажите время окончания работы";
    } else if (!isValidTime(formData.workEnd)) {
      newErrors.workEnd =
        "Неверный формат времени. Используйте HH:MM (например, 18:00)";
    }

    if (
      formData.workStart &&
      formData.workEnd &&
      isValidTime(formData.workStart) &&
      isValidTime(formData.workEnd)
    ) {
      if (compareTime(formData.workStart, formData.workEnd) >= 0) {
        newErrors.workEnd = "Время окончания должно быть позже времени начала";
      }
    }

    if (!formData.slotDurationMinutes) {
      newErrors.slotDurationMinutes = "Укажите длительность слота";
    } else if (formData.slotDurationMinutes < 15) {
      newErrors.slotDurationMinutes =
        "Длительность слота должна быть не менее 15 минут";
    } else if (formData.slotDurationMinutes > 240) {
      newErrors.slotDurationMinutes =
        "Длительность слота не может превышать 4 часа";
    }

    if (formData.breakStart && formData.breakEnd) {
      if (!isValidTime(formData.breakStart)) {
        newErrors.breakStart = "Неверный формат времени начала перерыва";
      }
      if (!isValidTime(formData.breakEnd)) {
        newErrors.breakEnd = "Неверный формат времени окончания перерыва";
      }
      if (isValidTime(formData.breakStart) && isValidTime(formData.breakEnd)) {
        if (compareTime(formData.breakStart, formData.breakEnd) >= 0) {
          newErrors.breakEnd = "Окончание перерыва должно быть позже начала";
        }

        // Проверка минимальной длительности перерыва (15 минут)
        const breakStartMinutes = parseInt(formData.breakStart.split(':')[0]) * 60 + parseInt(formData.breakStart.split(':')[1]);
        const breakEndMinutes = parseInt(formData.breakEnd.split(':')[0]) * 60 + parseInt(formData.breakEnd.split(':')[1]);
        const breakDuration = breakEndMinutes - breakStartMinutes;
        
        if (breakDuration < 15) {
          newErrors.breakEnd = "Перерыв должен быть не менее 15 минут";
        }

        if (
          formData.workStart &&
          formData.workEnd &&
          isValidTime(formData.workStart) &&
          isValidTime(formData.workEnd)
        ) {
          const workStartMinutes = parseInt(formData.workStart.split(':')[0]) * 60 + parseInt(formData.workStart.split(':')[1]);
          const workEndMinutes = parseInt(formData.workEnd.split(':')[0]) * 60 + parseInt(formData.workEnd.split(':')[1]);
          const breakStartMinutes = parseInt(formData.breakStart.split(':')[0]) * 60 + parseInt(formData.breakStart.split(':')[1]);
          const breakEndMinutes = parseInt(formData.breakEnd.split(':')[0]) * 60 + parseInt(formData.breakEnd.split(':')[1]);

          if (breakStartMinutes < workStartMinutes || breakEndMinutes > workEndMinutes) {
            newErrors.breakEnd = "Перерыв должен быть в пределах рабочего времени";
          }
        }
      }
    } else if (formData.breakStart && !formData.breakEnd) {
      newErrors.breakEnd = "Укажите окончание перерыва";
    } else if (!formData.breakStart && formData.breakEnd) {
      newErrors.breakStart = "Укажите начало перерыва";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    if (isEdit && hasChanges()) {
      Alert.alert(
        "Отмена",
        "У вас есть несохраненные изменения. Вы уверены, что хотите выйти?",
        [
          { text: "Продолжить редактирование", style: "cancel" },
          { text: "Выйти", onPress: onCancel, style: "destructive" }
        ]
      );
    } else {
      onCancel?.();
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const targetUserId = initialUserId || user?.id;

      if (!targetUserId) {
        Alert.alert("Ошибка", "Не удалось определить пользователя");
        return;
      }

      // Проверяем, что specialistId загружен
      if (!formData.specialistId || formData.specialistId === 0) {
        Alert.alert("Ошибка", "Не удалось загрузить ID специалиста. Попробуйте обновить страницу.");
        return;
      }

      const scheduleData: SpecialistScheduleCreateDto = {
        specialistId: formData.specialistId, // Используем загруженный ID
        specialistType: formData.specialistType,
        dayOfWeek: formData.dayOfWeek,
        workStart: formData.workStart,
        workEnd: formData.workEnd,
        breakStart: formData.breakStart || null,
        breakEnd: formData.breakEnd || null,
        slotDurationMinutes: formData.slotDurationMinutes,
      };

      console.log('📤 Schedule data:', JSON.stringify(scheduleData, null, 2));
      console.log('📤 Target userId:', targetUserId);
      console.log('📤 SpecialistId from formData:', formData.specialistId);

      if (isEdit && scheduleId) {
        await scheduleApi.updateSchedule(scheduleId, scheduleData);
        Alert.alert("Успех", "Расписание успешно обновлено");
      } else {
        await scheduleApi.createSchedule(scheduleData);
        Alert.alert("Успех", "Расписание успешно создано");

        // Сброс формы только для создания (не для редактирования)
        setFormData((prev) => ({
          ...getDefaultFormData(),
          specialistId: prev.specialistId,
          specialistType: prev.specialistType,
        }));
        setInitialFormData(null);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Error:", error?.response?.data);
      
      // Специфичная обработка ошибок
      if (error?.response?.status === 409) {
        Alert.alert(
          "Конфликт",
          "Расписание на этот день уже существует. Вы можете отредактировать существующее расписание."
        );
      } else if (error?.response?.status === 403) {
        Alert.alert("Доступ запрещен", "Вы не можете создавать расписание для другого специалиста");
      } else if (error?.response?.status === 400) {
        Alert.alert("Ошибка валидации", error?.response?.data?.message || "Проверьте правильность заполнения полей");
      } else {
        Alert.alert("Ошибка", error?.response?.data?.message || "Не удалось сохранить расписание");
      }
    } finally {
      setLoading(false);
    }
  };

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <View style={{ padding: spacing.lg, alignItems: "center" }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, textAlign: "center" },
          ]}
        >
          Необходимо авторизоваться
        </Text>
        <TouchableOpacity
          onPress={onCancel}
          style={{
            marginTop: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.primary.main,
            borderRadius: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isSpecialist) {
    return (
      <View style={{ padding: spacing.lg, alignItems: "center" }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, textAlign: "center" },
          ]}
        >
          Только специалисты могут создавать расписание
        </Text>
        <TouchableOpacity
          onPress={onCancel}
          style={{
            marginTop: spacing.md,
            padding: spacing.md,
            backgroundColor: colors.primary.main,
            borderRadius: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.inverse }}>Закрыть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loadingSpecialist) {
    return (
      <View style={{ padding: spacing.xl, alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.md },
          ]}
        >
          Загрузка информации о специалисте...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: spacing.md }}
      showsVerticalScrollIndicator={false}
    >
      <Text
        style={[
          typography.h3,
          { color: colors.text.primary, marginBottom: spacing.md },
        ]}
      >
        {isEdit ? "Редактировать расписание" : "Добавить расписание"}
      </Text>

      {/* ID специалиста - отображаем только для информации */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          ID специалиста
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border.light,
            borderRadius: spacing.sm,
            padding: spacing.sm,
            backgroundColor: colors.background.tertiary,
          }}
        >
          <Text style={{ color: colors.text.primary }}>
            {formData.specialistId || "Загрузка..."}
          </Text>
        </View>
        {errors.specialistId && (
          <Text
            style={{
              color: colors.error?.main || colors.primary.main,
              fontSize: 12,
              marginTop: spacing.xs,
            }}
          >
            {errors.specialistId}
          </Text>
        )}
      </View>

      {/* Тип специалиста */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          Тип специалиста
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border.light,
            borderRadius: spacing.sm,
            padding: spacing.sm,
            backgroundColor: colors.background.tertiary,
          }}
        >
          <Text style={{ color: colors.text.primary }}>
            {formData.specialistType === "VET"
              ? "Ветеринар"
              : "Сервис (груминг, тренировки и т.д.)"}
          </Text>
        </View>
      </View>

      {/* День недели */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          День недели *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: spacing.xs }}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.value}
                onPress={() =>
                  setFormData({ ...formData, dayOfWeek: day.value })
                }
                style={{
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.md,
                  borderRadius: spacing.md,
                  backgroundColor:
                    formData.dayOfWeek === day.value
                      ? colors.primary.main
                      : colors.background.tertiary,
                  borderWidth: 1,
                  borderColor:
                    formData.dayOfWeek === day.value
                      ? colors.primary.main
                      : colors.border.light,
                }}
              >
                <Text
                  style={{
                    color:
                      formData.dayOfWeek === day.value
                        ? colors.text.inverse
                        : colors.text.primary,
                  }}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Время начала */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
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
            borderColor: errors.workStart
              ? colors.error?.main || colors.primary.main
              : colors.border.light,
            borderRadius: spacing.sm,
            padding: spacing.sm,
            fontSize: 16,
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
          }}
        />
        {errors.workStart && (
          <Text
            style={{
              color: colors.error?.main || colors.primary.main,
              fontSize: 12,
              marginTop: spacing.xs,
            }}
          >
            {errors.workStart}
          </Text>
        )}
      </View>

      {/* Время окончания */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
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
            borderColor: errors.workEnd
              ? colors.error?.main || colors.primary.main
              : colors.border.light,
            borderRadius: spacing.sm,
            padding: spacing.sm,
            fontSize: 16,
            backgroundColor: colors.background.primary,
            color: colors.text.primary,
          }}
        />
        {errors.workEnd && (
          <Text
            style={{
              color: colors.error?.main || colors.primary.main,
              fontSize: 12,
              marginTop: spacing.xs,
            }}
          >
            {errors.workEnd}
          </Text>
        )}
      </View>

      {/* Длительность слота */}
      <View style={{ marginBottom: spacing.md }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          Длительность слота (минуты) *
        </Text>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}
        >
          {[15, 30, 45, 60, 90, 120].map((duration) => (
            <TouchableOpacity
              key={duration}
              onPress={() =>
                setFormData({ ...formData, slotDurationMinutes: duration })
              }
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.md,
                backgroundColor:
                  formData.slotDurationMinutes === duration
                    ? colors.primary.main
                    : colors.background.tertiary,
                borderWidth: 1,
                borderColor:
                  formData.slotDurationMinutes === duration
                    ? colors.primary.main
                    : colors.border.light,
              }}
            >
              <Text
                style={{
                  color:
                    formData.slotDurationMinutes === duration
                      ? colors.text.inverse
                      : colors.text.primary,
                }}
              >
                {duration} мин
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.slotDurationMinutes && (
          <Text
            style={{
              color: colors.error?.main || colors.primary.main,
              fontSize: 12,
              marginTop: spacing.xs,
            }}
          >
            {errors.slotDurationMinutes}
          </Text>
        )}
      </View>

      {/* Перерыв */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            typography.body1,
            { color: colors.text.primary, marginBottom: spacing.xs },
          ]}
        >
          Перерыв (опционально)
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginBottom: spacing.xs },
              ]}
            >
              Начало
            </Text>
            <TextInput
              value={formData.breakStart || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, breakStart: text || null })
              }
              placeholder="13:00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numbers-and-punctuation"
              style={{
                borderWidth: 1,
                borderColor: errors.breakStart
                  ? colors.error?.main || colors.primary.main
                  : colors.border.light,
                borderRadius: spacing.sm,
                padding: spacing.sm,
                fontSize: 16,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
            {errors.breakStart && (
              <Text
                style={{
                  color: colors.error?.main || colors.primary.main,
                  fontSize: 12,
                  marginTop: spacing.xs,
                }}
              >
                {errors.breakStart}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginBottom: spacing.xs },
              ]}
            >
              Окончание
            </Text>
            <TextInput
              value={formData.breakEnd || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, breakEnd: text || null })
              }
              placeholder="14:00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numbers-and-punctuation"
              style={{
                borderWidth: 1,
                borderColor: errors.breakEnd
                  ? colors.error?.main || colors.primary.main
                  : colors.border.light,
                borderRadius: spacing.sm,
                padding: spacing.sm,
                fontSize: 16,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
            {errors.breakEnd && (
              <Text
                style={{
                  color: colors.error?.main || colors.primary.main,
                  fontSize: 12,
                  marginTop: spacing.xs,
                }}
              >
                {errors.breakEnd}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Кнопки */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        {onCancel && (
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              flex: 1,
              backgroundColor: colors.background.tertiary,
              padding: spacing.md,
              borderRadius: spacing.sm,
              alignItems: "center",
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
          disabled={loading || loadingSpecialist}
          style={{
            flex: 1,
            backgroundColor: colors.primary.main,
            padding: spacing.md,
            borderRadius: spacing.sm,
            alignItems: "center",
            opacity: loading || loadingSpecialist ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={[typography.button, { color: colors.text.inverse }]}>
              {isEdit ? "Обновить расписание" : "Сохранить расписание"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};