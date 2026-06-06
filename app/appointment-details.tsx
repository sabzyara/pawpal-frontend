// app/appointment/[id].tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { useAppointmentDetails } from "@/hooks/useAppointments";
import { useAuthStore } from "@/store/authStore";
import { useUserRole } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { AppointmentStatus } from "@/types/appointment.types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: "#FF9800",
  CONFIRMED: "#2196F3",
  COMPLETED: "#4CAF50",
  CANCELLED_BY_USER: "#F44336",
  CANCELLED_BY_SPECIALIST: "#F44336",
  NO_SHOW: "#9E9E9E",
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: "Ожидает",
  CONFIRMED: "Подтверждено",
  COMPLETED: "Завершено",
  CANCELLED_BY_USER: "Отменено",
  CANCELLED_BY_SPECIALIST: "Отменено специалистом",
  NO_SHOW: "Неявка",
};

const MAX_NOTES_LENGTH = 3000;

export default function AppointmentDetailScreen() {
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const user = useAuthStore((state) => state.user);
  const { isOwner, isSpecialist } = useUserRole();

  const {
    appointment,
    loading,
    recommendations,
    refresh,
    updateAppointment,
    cancelAppointment,
  } = useAppointmentDetails(Number(id));

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [isEditingOwnerNotes, setIsEditingOwnerNotes] = useState(false);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [savingOwnerNotes, setSavingOwnerNotes] = useState(false);

  const [isEditingSpecialistNotes, setIsEditingSpecialistNotes] = useState(false);
  const [specialistNotes, setSpecialistNotes] = useState("");
  const [savingSpecialistNotes, setSavingSpecialistNotes] = useState(false);

  useEffect(() => {
    if (appointment?.ownerNotes) {
      setOwnerNotes(appointment.ownerNotes);
    }
    if (appointment?.specialistNotes) {
      setSpecialistNotes(appointment.specialistNotes);
    }
  }, [appointment?.ownerNotes, appointment?.specialistNotes]);

  const validateNotesLength = useCallback(
    (text: string, fieldName: string): boolean => {
      if (text.length > MAX_NOTES_LENGTH) {
        Alert.alert(
          "Ошибка",
          `${fieldName} не может превышать ${MAX_NOTES_LENGTH} символов`,
        );
        return false;
      }
      return true;
    },
    [],
  );

  const handleCancel = async () => {
    if (!cancelAppointment) {
      Alert.alert("Ошибка", "Функция отмены недоступна");
      return;
    }

    if (!cancelReason.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, укажите причину отмены");
      return;
    }

    try {
      await cancelAppointment(Number(id), cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось отменить запись");
    }
  };

  const handleSaveOwnerNotes = async () => {
    if (!updateAppointment) {
      Alert.alert("Ошибка", "Функция сохранения недоступна");
      return;
    }

    if (!validateNotesLength(ownerNotes, "Заметки")) return;

    setSavingOwnerNotes(true);
    try {
      await updateAppointment({ ownerNotes });
      setIsEditingOwnerNotes(false);
      Alert.alert("Успех", "Заметки сохранены");
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось сохранить заметки");
    } finally {
      setSavingOwnerNotes(false);
    }
  };

  const handleSaveSpecialistNotes = async () => {
    if (!updateAppointment) {
      Alert.alert("Ошибка", "Функция сохранения недоступна");
      return;
    }

    if (!validateNotesLength(specialistNotes, "Заметки специалиста")) return;

    setSavingSpecialistNotes(true);
    try {
      await updateAppointment({ specialistNotes });
      setIsEditingSpecialistNotes(false);
      Alert.alert("Успех", "Заметки специалиста сохранены");
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось сохранить заметки специалиста");
    } finally {
      setSavingSpecialistNotes(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const canCancel =
    appointment?.status === "CREATED" || appointment?.status === "CONFIRMED";
  const errorColor = colors.error?.main || "#F44336";

  // Проверка, что appointment загружен
  if (loading || !appointment) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.secondary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: spacing.md }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text
            style={[
              typography.caption,
              {
                color: colors.primary.main,
                marginBottom: 4,
                fontWeight: "600",
              },
            ]}
          >
            ЗАПИСЬ
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={[typography.h2, { color: colors.text.primary }]}>
              Детали записи
            </Text>
            {appointment?.status && (
              <View
                style={{
                  backgroundColor:
                    (statusColors[appointment.status as AppointmentStatus] ||
                      "#999") + "20",
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color:
                      statusColors[appointment.status as AppointmentStatus] ||
                      "#999",
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {statusLabels[appointment.status as AppointmentStatus] ||
                    appointment.status}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              typography.body2,
              {
                color: colors.text.secondary,
                marginTop: 4,
              },
            ]}
          >
            Просмотр и управление записью
          </Text>
        </View>

        {/* Specialist Info */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              { color: colors.text.primary, marginBottom: spacing.sm },
            ]}
          >
            Специалист
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary.main + "15",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="medkit-outline"
                size={28}
                color={colors.primary.main}
              />
            </View>
            <View>
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.text.primary },
                ]}
              >
                {appointment.specialistName ||
                  `Специалист #${appointment.specialistId}`}
              </Text>
              <Text
                style={[typography.caption, { color: colors.text.secondary }]}
              >
                {appointment.specialistType === "VET"
                  ? "Ветеринар"
                  : "Специалист"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pet Info */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              { color: colors.text.primary, marginBottom: spacing.sm },
            ]}
          >
            Питомец
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.background.tertiary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="paw" size={28} color={colors.primary.main} />
            </View>
            <View>
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.text.primary },
                ]}
              >
                🐾 {appointment.petName || `Питомец #${appointment.petId}`}
              </Text>
              <Text
                style={[typography.caption, { color: colors.text.secondary }]}
              >
                {appointment.petType || "Не указан"}{" "}
                {appointment.petBreed ? `• ${appointment.petBreed}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              { color: colors.text.primary, marginBottom: spacing.md },
            ]}
          >
            Дата и время
          </Text>
          <View style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={colors.primary.main}
              />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {new Date(appointment.date).toLocaleDateString("ru-RU", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={colors.primary.main}
              />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {appointment.startTime?.substring(0, 5)} -{" "}
                {appointment.endTime?.substring(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* Owner Notes */}
        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.sm,
            }}
          >
            <Text
              style={[typography.body1SemiBold, { color: colors.text.primary }]}
            >
              {isOwner ? "Мои заметки" : "Заметки клиента"}
            </Text>
            {isOwner && (
              <TouchableOpacity onPress={() => setIsEditingOwnerNotes(true)}>
                <Ionicons name="pencil" size={20} color={colors.primary.main} />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={{
              backgroundColor: colors.background.tertiary,
              padding: spacing.md,
              borderRadius: 16,
              marginTop: spacing.xs,
            }}
          >
            <Text style={[typography.body2, { color: colors.text.secondary }]}>
              {appointment.ownerNotes || "Нет заметок"}
            </Text>
          </View>
          <Text
            style={[
              typography.caption,
              { color: colors.text.tertiary, marginTop: spacing.xs },
            ]}
          >
            {appointment.ownerNotes?.length || 0}/{MAX_NOTES_LENGTH} символов
          </Text>
        </View>

        {/* Specialist Notes (only for specialist) */}
        {isSpecialist && (
          <View
            style={{
              backgroundColor: colors.card.default,
              borderRadius: 24,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.border.light,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.text.primary },
                ]}
              >
                Заметки специалиста
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingSpecialistNotes(true)}
              >
                <Ionicons name="pencil" size={20} color={colors.primary.main} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: colors.background.tertiary,
                padding: spacing.md,
                borderRadius: 16,
                marginTop: spacing.xs,
              }}
            >
              <Text
                style={[typography.body2, { color: colors.text.secondary }]}
              >
                {appointment.specialistNotes || "Нет заметок"}
              </Text>
            </View>
            <Text
              style={[
                typography.caption,
                { color: colors.text.tertiary, marginTop: spacing.xs },
              ]}
            >
              {appointment.specialistNotes?.length || 0}/{MAX_NOTES_LENGTH}{" "}
              символов
            </Text>
          </View>
        )}

        {/* Recommendations */}
        {recommendations && (
          <View
            style={{
              backgroundColor: colors.primary.main + "08",
              borderRadius: 24,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.primary.main,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <Ionicons
                name="bulb-outline"
                size={22}
                color={colors.primary.main}
              />
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.primary.main },
                ]}
              >
                Рекомендации
              </Text>
            </View>
            <Text style={[typography.body2, { color: colors.text.primary }]}>
              {recommendations}
            </Text>
          </View>
        )}

        {/* Cancel Button */}
        {canCancel && cancelAppointment && (
          <TouchableOpacity
            onPress={() => setShowCancelModal(true)}
            style={{
              backgroundColor: colors.error.main + "15",
              padding: spacing.md,
              borderRadius: 16,
              alignItems: "center",
              marginTop: spacing.md,
              borderWidth: 1,
              borderColor: colors.error.main,
              flexDirection: "row",
              justifyContent: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={errorColor}
            />
            <Text
              style={{ color: errorColor, fontWeight: "600", fontSize: 16 }}
            >
              Отменить запись
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal for editing owner notes */}
      <Modal visible={isEditingOwnerNotes} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 50,
                height: 5,
                borderRadius: 999,
                backgroundColor: colors.border.light,
                marginBottom: 20,
              }}
            />
            <Text
              style={[
                typography.h3,
                { color: colors.text.primary, marginBottom: spacing.md },
              ]}
            >
              {isOwner ? "Редактировать заметки" : "Заметки клиента"}
            </Text>
            <TextInput
              value={ownerNotes}
              onChangeText={setOwnerNotes}
              placeholder="Введите заметки"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              maxLength={MAX_NOTES_LENGTH}
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 16,
                padding: spacing.md,
                minHeight: 120,
                textAlignVertical: "top",
                backgroundColor: colors.background.secondary,
                color: colors.text.primary,
                fontSize: 16,
              }}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: colors.text.tertiary,
                  marginTop: spacing.xs,
                  textAlign: "right",
                },
              ]}
            >
              {ownerNotes.length}/{MAX_NOTES_LENGTH}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <TouchableOpacity onPress={() => setIsEditingOwnerNotes(false)}>
                <Text
                  style={[
                    typography.body1,
                    {
                      color: colors.text.secondary,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                >
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveOwnerNotes}
                disabled={savingOwnerNotes}
              >
                {savingOwnerNotes ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <Text
                    style={[
                      typography.body1SemiBold,
                      {
                        color: colors.primary.main,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.sm,
                      },
                    ]}
                  >
                    Сохранить
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for editing specialist notes */}
      <Modal
        visible={isEditingSpecialistNotes}
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 50,
                height: 5,
                borderRadius: 999,
                backgroundColor: colors.border.light,
                marginBottom: 20,
              }}
            />
            <Text
              style={[
                typography.h3,
                { color: colors.text.primary, marginBottom: spacing.md },
              ]}
            >
              Редактировать заметки специалиста
            </Text>
            <TextInput
              value={specialistNotes}
              onChangeText={setSpecialistNotes}
              placeholder="Введите заметки специалиста"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={5}
              maxLength={MAX_NOTES_LENGTH}
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 16,
                padding: spacing.md,
                minHeight: 120,
                textAlignVertical: "top",
                backgroundColor: colors.background.secondary,
                color: colors.text.primary,
                fontSize: 16,
              }}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: colors.text.tertiary,
                  marginTop: spacing.xs,
                  textAlign: "right",
                },
              ]}
            >
              {specialistNotes.length}/{MAX_NOTES_LENGTH}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: spacing.lg,
                gap: spacing.sm,
              }}
            >
              <TouchableOpacity
                onPress={() => setIsEditingSpecialistNotes(false)}
              >
                <Text
                  style={[
                    typography.body1,
                    {
                      color: colors.text.secondary,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                >
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSpecialistNotes}
                disabled={savingSpecialistNotes}
              >
                {savingSpecialistNotes ? (
                  <ActivityIndicator size="small" color={colors.primary.main} />
                ) : (
                  <Text
                    style={[
                      typography.body1SemiBold,
                      {
                        color: colors.primary.main,
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.sm,
                      },
                    ]}
                  >
                    Сохранить
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
          activeOpacity={1}
          onPress={() => setShowCancelModal(false)}
        >
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 50,
                height: 5,
                borderRadius: 999,
                backgroundColor: colors.border.light,
                marginBottom: 20,
              }}
            />
            <Text
              style={[
                typography.h3,
                { color: colors.text.primary, marginBottom: 16 },
              ]}
            >
              Отмена записи
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.secondary, marginBottom: 16 },
              ]}
            >
              Пожалуйста, укажите причину отмены
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Введите причину отмены"
              placeholderTextColor={colors.text.tertiary}
              multiline
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 16,
                padding: spacing.md,
                minHeight: 100,
                textAlignVertical: "top",
                backgroundColor: colors.background.secondary,
                color: colors.text.primary,
                fontSize: 16,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: spacing.lg,
                gap: spacing.md,
              }}
            >
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Text
                  style={[
                    typography.body1,
                    {
                      color: colors.text.secondary,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                >
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  backgroundColor: errorColor,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={[
                    typography.body1SemiBold,
                    { color: colors.text.inverse },
                  ]}
                >
                  Отменить запись
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}