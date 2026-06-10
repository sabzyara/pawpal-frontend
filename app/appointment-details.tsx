// app/appointment-details.tsx

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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

const statusColors: Record<AppointmentStatus, string> = {
  CREATED: "#FF9800",
  CONFIRMED: "#2196F3",
  COMPLETED: "#10B981",
  CANCELLED_BY_USER: "#DC2626",
  CANCELLED_BY_SPECIALIST: "#DC2626",
  NO_SHOW: "#6B7280",
};

const statusLabels: Record<AppointmentStatus, string> = {
  CREATED: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED_BY_USER: "Cancelled",
  CANCELLED_BY_SPECIALIST: "Cancelled by Specialist",
  NO_SHOW: "No Show",
};

const statusIcons: Record<AppointmentStatus, keyof typeof Ionicons.glyphMap> = {
  CREATED: "time-outline",
  CONFIRMED: "checkmark-circle-outline",
  COMPLETED: "checkmark-done-circle-outline",
  CANCELLED_BY_USER: "close-circle-outline",
  CANCELLED_BY_SPECIALIST: "close-circle-outline",
  NO_SHOW: "person-remove-outline",
};

const MAX_NOTES_LENGTH = 3000;
const MAX_RECOMMENDATIONS_LENGTH = 5000;

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
    addRecommendations,
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

  // Для добавления рекомендаций (только специалист)
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [recommendationsText, setRecommendationsText] = useState("");
  const [specialistNotesForRecommendations, setSpecialistNotesForRecommendations] = useState("");
  const [savingRecommendations, setSavingRecommendations] = useState(false);

  // Для завершения приема (только специалист)
  const [completingAppointment, setCompletingAppointment] = useState(false);

  useEffect(() => {
    if (appointment?.ownerNotes) {
      setOwnerNotes(appointment.ownerNotes);
    }
    if (appointment?.specialistNotes) {
      setSpecialistNotes(appointment.specialistNotes);
    }
  }, [appointment?.ownerNotes, appointment?.specialistNotes]);

  const validateNotesLength = useCallback(
    (text: string, fieldName: string, maxLength: number = MAX_NOTES_LENGTH): boolean => {
      if (text.length > maxLength) {
        Alert.alert(
          "Error",
          `${fieldName} cannot exceed ${maxLength} characters`,
        );
        return false;
      }
      return true;
    },
    [],
  );

  // Отмена записи (для владельца)
  const handleCancel = async () => {
    if (!cancelAppointment) {
      Alert.alert("Error", "Cancel function unavailable");
      return;
    }

    if (!cancelReason.trim()) {
      Alert.alert("Error", "Please provide a cancellation reason");
      return;
    }

    try {
      await cancelAppointment(Number(id), cancelReason);
      setShowCancelModal(false);
      setCancelReason("");
      Alert.alert("Success", "Appointment cancelled successfully");
      refresh();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to cancel appointment");
    }
  };

  // Сохранение заметок владельца (для OWNER)
  const handleSaveOwnerNotes = async () => {
    if (!updateAppointment) {
      Alert.alert("Error", "Save function unavailable");
      return;
    }

    if (!validateNotesLength(ownerNotes, "Notes")) return;

    setSavingOwnerNotes(true);
    try {
      await updateAppointment({ ownerNotes });
      setIsEditingOwnerNotes(false);
      Alert.alert("Success", "Notes saved successfully");
      refresh();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save notes");
    } finally {
      setSavingOwnerNotes(false);
    }
  };

  // Сохранение заметок специалиста (для SPECIALIST)
  const handleSaveSpecialistNotes = async () => {
    if (!updateAppointment) {
      Alert.alert("Error", "Save function unavailable");
      return;
    }

    if (!validateNotesLength(specialistNotes, "Specialist notes")) return;

    setSavingSpecialistNotes(true);
    try {
      await updateAppointment({ specialistNotes });
      setIsEditingSpecialistNotes(false);
      Alert.alert("Success", "Specialist notes saved successfully");
      refresh();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save specialist notes");
    } finally {
      setSavingSpecialistNotes(false);
    }
  };

  // Завершение приема (для SPECIALIST)
  const handleCompleteAppointment = async () => {
    Alert.alert(
      "Complete Appointment",
      "Are you sure you want to mark this appointment as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setCompletingAppointment(true);
            try {
              const { completeAppointment } = useAppointmentDetails(Number(id));
              await completeAppointment?.(Number(id));
              Alert.alert("Success", "Appointment completed successfully");
              refresh();
            } catch (error: any) {
              Alert.alert("Error", error?.message || "Failed to complete appointment");
            } finally {
              setCompletingAppointment(false);
            }
          },
        },
      ]
    );
  };

  // Добавление рекомендаций (для SPECIALIST)
  const handleAddRecommendations = async () => {
    if (!addRecommendations) {
      Alert.alert("Error", "Add recommendations function unavailable");
      return;
    }

    if (!recommendationsText.trim()) {
      Alert.alert("Error", "Please enter recommendations");
      return;
    }

    if (!validateNotesLength(recommendationsText, "Recommendations", MAX_RECOMMENDATIONS_LENGTH)) return;

    setSavingRecommendations(true);
    try {
      await addRecommendations(Number(id), {
        recommendations: recommendationsText.trim(),
        specialistNotes: specialistNotesForRecommendations.trim() || undefined,
      });
      Alert.alert("Success", "Recommendations added successfully");
      setShowRecommendationsModal(false);
      setRecommendationsText("");
      setSpecialistNotesForRecommendations("");
      refresh();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to add recommendations");
    } finally {
      setSavingRecommendations(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const canCancel =
    appointment?.status === "CREATED" || appointment?.status === "CONFIRMED";
  const canComplete =
    isSpecialist && appointment?.status === "CONFIRMED";
  const canAddRecommendations =
    isSpecialist && appointment?.status === "COMPLETED" && !recommendations;
  
  const errorColor = colors.error?.main || "#DC2626";
  const statusColor = appointment?.status ? statusColors[appointment.status as AppointmentStatus] : "#999";
  const statusIcon = appointment?.status ? statusIcons[appointment.status as AppointmentStatus] : "calendar-outline";

  if (loading || !appointment) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </SafeAreaView>
    );
  }

  // Компонент модального окна для заметок
  const renderNotesModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    value: string,
    onChangeText: (text: string) => void,
    onSave: () => void,
    saving: boolean,
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                maxHeight: Platform.OS === "ios" ? "80%" : "90%",
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  width: 50,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: colors.border?.light || "#E5E7EB",
                  marginBottom: 20,
                }}
              />
              
              <Text
                style={[
                  typography.h3,
                  { color: colors.text.primary, marginBottom: spacing.md },
                ]}
              >
                {title}
              </Text>
              
              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
              >
                <TextInput
                  value={value}
                  onChangeText={onChangeText}
                  placeholder="Enter your notes..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={8}
                  maxLength={MAX_NOTES_LENGTH}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border?.light || "#E5E7EB",
                    borderRadius: 16,
                    padding: spacing.md,
                    minHeight: 150,
                    textAlignVertical: "top",
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    fontSize: 16,
                  }}
                  autoFocus={true}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={Keyboard.dismiss}
                />
              </ScrollView>
              
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
                {value.length}/{MAX_NOTES_LENGTH}
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
                  onPress={onClose}
                  style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}
                >
                  <Text style={[typography.body1, { color: colors.text.secondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onSave}
                  disabled={saving}
                  style={{
                    backgroundColor: colors.primary.main,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                    borderRadius: 14,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  ) : (
                    <Text style={[typography.body1SemiBold, { color: colors.text.inverse }]}>
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Модальное окно для добавления рекомендаций (только специалист)
  const renderRecommendationsModal = () => (
    <Modal
      visible={showRecommendationsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRecommendationsModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                maxHeight: Platform.OS === "ios" ? "80%" : "90%",
              }}
            >
              <View
                style={{
                  alignSelf: "center",
                  width: 50,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: colors.border?.light || "#E5E7EB",
                  marginBottom: 20,
                }}
              />
              
              <Text
                style={[
                  typography.h3,
                  { color: colors.text.primary, marginBottom: spacing.sm },
                ]}
              >
                Add Recommendations
              </Text>
              
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.secondary, marginBottom: spacing.md },
                ]}
              >
                These will be visible to the pet owner
              </Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  style={[
                    typography.body2,
                    { color: colors.text.primary, marginBottom: spacing.xs },
                  ]}
                >
                  Recommendations *
                </Text>
                <TextInput
                  value={recommendationsText}
                  onChangeText={setRecommendationsText}
                  placeholder="Enter treatment recommendations, follow-up instructions, etc..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={6}
                  maxLength={MAX_RECOMMENDATIONS_LENGTH}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border?.light || "#E5E7EB",
                    borderRadius: 16,
                    padding: spacing.md,
                    minHeight: 120,
                    textAlignVertical: "top",
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    fontSize: 16,
                    marginBottom: spacing.md,
                  }}
                />
                
                <Text
                  style={[
                    typography.body2,
                    { color: colors.text.primary, marginBottom: spacing.xs },
                  ]}
                >
                  Private Notes (optional)
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.tertiary, marginBottom: spacing.sm },
                  ]}
                >
                  These are only visible to you
                </Text>
                <TextInput
                  value={specialistNotesForRecommendations}
                  onChangeText={setSpecialistNotesForRecommendations}
                  placeholder="Add private notes about the treatment..."
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  maxLength={MAX_NOTES_LENGTH}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border?.light || "#E5E7EB",
                    borderRadius: 16,
                    padding: spacing.md,
                    minHeight: 100,
                    textAlignVertical: "top",
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    fontSize: 16,
                    marginBottom: spacing.md,
                  }}
                />
              </ScrollView>
              
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
                {recommendationsText.length}/{MAX_RECOMMENDATIONS_LENGTH}
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
                  onPress={() => setShowRecommendationsModal(false)}
                  style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}
                >
                  <Text style={[typography.body1, { color: colors.text.secondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddRecommendations}
                  disabled={savingRecommendations}
                  style={{
                    backgroundColor: colors.primary.main,
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.lg,
                    borderRadius: 14,
                  }}
                >
                  {savingRecommendations ? (
                    <ActivityIndicator size="small" color={colors.text.inverse} />
                  ) : (
                    <Text style={[typography.body1SemiBold, { color: colors.text.inverse }]}>
                      Add Recommendations
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border?.light || "#E5E7EB",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.background.tertiary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back-outline" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <View
            style={{
              backgroundColor: statusColor + "15",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name={statusIcon} size={14} color={statusColor} />
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: "600" }}>
              {statusLabels[appointment.status as AppointmentStatus] || appointment.status}
            </Text>
          </View>
        </View>
      </View>

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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Specialist Info Card */}
        <View
          style={{
            backgroundColor: colors.card?.default || colors.background.secondary,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border?.light || "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primary.main + "15",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="medkit-outline" size={28} color={colors.primary.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.text.primary, fontSize: 16 },
                ]}
              >
                {appointment.specialistName || `Specialist #${appointment.specialistId}`}
              </Text>
              <Text
                style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
              >
                {appointment.specialistType === "VET" ? "Veterinarian" : "Specialist"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pet Info Card */}
        <View
          style={{
            backgroundColor: colors.card?.default || colors.background.secondary,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border?.light || "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.background.tertiary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="paw-outline" size={28} color={colors.primary.main} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.text.primary, fontSize: 16 },
                ]}
              >
                {appointment.petName || `Pet #${appointment.petId}`}
              </Text>
              <Text
                style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}
              >
                {appointment.petType || "Not specified"}
                {appointment.petBreed ? ` • ${appointment.petBreed}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time Card */}
        <View
          style={{
            backgroundColor: colors.card?.default || colors.background.secondary,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border?.light || "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ gap: spacing.md }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                backgroundColor: colors.background.tertiary,
                padding: 12,
                borderRadius: 16,
              }}
            >
              <Ionicons name="calendar-outline" size={22} color={colors.primary.main} />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {new Date(appointment.date).toLocaleDateString("en-US", {
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
                backgroundColor: colors.background.tertiary,
                padding: 12,
                borderRadius: 16,
              }}
            >
              <Ionicons name="time-outline" size={22} color={colors.primary.main} />
              <Text style={[typography.body2, { color: colors.text.primary }]}>
                {appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)}
              </Text>
            </View>
          </View>
        </View>

        {/* Owner Notes Card - виден всем, редактирует только OWNER */}
        <View
          style={{
            backgroundColor: colors.card?.default || colors.background.secondary,
            borderRadius: 24,
            padding: spacing.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: colors.border?.light || "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
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
              {isOwner ? "My Notes" : "Client Notes"}
            </Text>
            {isOwner && (
              <TouchableOpacity 
                onPress={() => setIsEditingOwnerNotes(true)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.background.tertiary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary.main} />
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
              {appointment.ownerNotes || "No notes"}
            </Text>
          </View>
          <Text
            style={[
              typography.caption,
              { color: colors.text.tertiary, marginTop: spacing.xs, textAlign: "right" },
            ]}
          >
            {appointment.ownerNotes?.length || 0}/{MAX_NOTES_LENGTH}
          </Text>
        </View>

        {/* Specialist Notes Card - виден только SPECIALIST, он же может редактировать */}
        {isSpecialist && (
          <View
            style={{
              backgroundColor: colors.card?.default || colors.background.secondary,
              borderRadius: 24,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.border?.light || "#E5E7EB",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
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
                Specialist Notes
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingSpecialistNotes(true)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.background.tertiary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary.main} />
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
              <Text style={[typography.body2, { color: colors.text.secondary }]}>
                {appointment.specialistNotes || "No notes"}
              </Text>
            </View>
            <Text
              style={[
                typography.caption,
                { color: colors.text.tertiary, marginTop: spacing.xs, textAlign: "right" },
              ]}
            >
              {appointment.specialistNotes?.length || 0}/{MAX_NOTES_LENGTH}
            </Text>
          </View>
        )}

        {/* Recommendations Card - виден всем, если есть */}
        {recommendations && (
          <View
            style={{
              backgroundColor: colors.primary.main + "08",
              borderRadius: 24,
              padding: spacing.md,
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.primary.main + "30",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
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
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.primary.main + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="bulb-outline" size={18} color={colors.primary.main} />
              </View>
              <Text
                style={[
                  typography.body1SemiBold,
                  { color: colors.primary.main },
                ]}
              >
                Recommendations
              </Text>
            </View>
            <Text style={[typography.body2, { color: colors.text.primary, lineHeight: 20 }]}>
              {recommendations}
            </Text>
          </View>
        )}

        {/* Кнопка добавления рекомендаций (только для специалиста, если прием завершен и нет рекомендаций) */}
        {canAddRecommendations && (
          <TouchableOpacity
            onPress={() => setShowRecommendationsModal(true)}
            style={{
              backgroundColor: colors.primary.main + "15",
              padding: spacing.md,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.primary.main,
              flexDirection: "row",
              justifyContent: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
            <Text style={{ color: colors.primary.main, fontWeight: "600", fontSize: 16 }}>
              Add Recommendations
            </Text>
          </TouchableOpacity>
        )}

        {/* Кнопка завершения приема (только для специалиста) */}
        {canComplete && (
          <TouchableOpacity
            onPress={handleCompleteAppointment}
            disabled={completingAppointment}
            style={{
              backgroundColor: colors.success?.main || "#10B981" + "15",
              padding: spacing.md,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: spacing.md,
              borderWidth: 1,
              borderColor: colors.success?.main || "#10B981",
              flexDirection: "row",
              justifyContent: "center",
              gap: spacing.sm,
            }}
          >
            {completingAppointment ? (
              <ActivityIndicator size="small" color={colors.success?.main || "#10B981"} />
            ) : (
              <>
                <Ionicons name="checkmark-done-outline" size={20} color={colors.success?.main || "#10B981"} />
                <Text style={{ color: colors.success?.main || "#10B981", fontWeight: "600", fontSize: 16 }}>
                  Complete Appointment
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Кнопка отмены записи (для владельца или специалиста) */}
        {canCancel && cancelAppointment && (
          <TouchableOpacity
            onPress={() => setShowCancelModal(true)}
            style={{
              backgroundColor: errorColor + "15",
              padding: spacing.md,
              borderRadius: 20,
              alignItems: "center",
              marginTop: spacing.md,
              borderWidth: 1,
              borderColor: errorColor,
              flexDirection: "row",
              justifyContent: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color={errorColor} />
            <Text style={{ color: errorColor, fontWeight: "600", fontSize: 16 }}>
              Cancel Appointment
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Edit Owner Notes Modal */}
      {renderNotesModal(
        isEditingOwnerNotes,
        () => setIsEditingOwnerNotes(false),
        isOwner ? "Edit Notes" : "Client Notes",
        ownerNotes,
        setOwnerNotes,
        handleSaveOwnerNotes,
        savingOwnerNotes,
      )}

      {/* Edit Specialist Notes Modal */}
      {renderNotesModal(
        isEditingSpecialistNotes,
        () => setIsEditingSpecialistNotes(false),
        "Edit Specialist Notes",
        specialistNotes,
        setSpecialistNotes,
        handleSaveSpecialistNotes,
        savingSpecialistNotes,
      )}

      {/* Add Recommendations Modal */}
      {renderRecommendationsModal()}

      {/* Cancel Appointment Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: colors.background.primary,
                  borderRadius: 28,
                  padding: 24,
                  width: "85%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <View style={{ alignItems: "center", marginBottom: spacing.md }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: errorColor + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: spacing.sm,
                    }}
                  >
                    <Ionicons name="alert-circle-outline" size={28} color={errorColor} />
                  </View>
                  <Text
                    style={[
                      typography.h4,
                      { color: colors.text.primary, marginBottom: 8 },
                    ]}
                  >
                    Cancel Appointment
                  </Text>
                  <Text
                    style={[
                      typography.body2,
                      { color: colors.text.secondary, textAlign: "center" },
                    ]}
                  >
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
                    borderColor: colors.border?.light || "#E5E7EB",
                    borderRadius: 16,
                    padding: spacing.md,
                    minHeight: 100,
                    textAlignVertical: "top",
                    backgroundColor: colors.background.tertiary,
                    color: colors.text.primary,
                    fontSize: 14,
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
                  <TouchableOpacity
                    onPress={() => setShowCancelModal(false)}
                    style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}
                  >
                    <Text style={[typography.body1, { color: colors.text.secondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={{
                      backgroundColor: errorColor,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.lg,
                      borderRadius: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="checkmark-outline" size={18} color={colors.text.inverse} />
                    <Text style={[typography.body1SemiBold, { color: colors.text.inverse }]}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}