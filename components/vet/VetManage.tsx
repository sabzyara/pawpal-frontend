// components/VetManage.tsx 

import { ScheduleForm } from "@/components/schedule/ScheduleForm";
import { SlotManagement } from "@/components/slots/SlotManagement";
import { useAuthStore } from "@/store/authStore";
import { useUserRole } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { specialistService } from "@/services/appointmentApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import "@/app/i18n";
import { useTranslation } from 'react-i18next';


interface VetManageProps {
  userId: number;
  specialistType?: "VET" | "SERVICE";
  onDelete?: () => void;  
}

type ManageTabType = "schedule" | "slots";

export const VetManage: React.FC<VetManageProps> = ({
  userId,
  specialistType: propSpecialistType,
  onDelete,
}) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);  
  const { isSpecialist } = useUserRole();
  
  const [activeTab, setActiveTab] = useState<ManageTabType>("schedule");
  const [deleting, setDeleting] = useState(false);
  const [specialistInfo, setSpecialistInfo] = useState<{ 
    specialistId: number; 
    specialistType: "VET" | "SERVICE";
    userId: number;
  } | null>(null);
  const [loadingSpecialist, setLoadingSpecialist] = useState(true);

  useEffect(() => {
    loadSpecialistInfo();
  }, [userId]);

  const loadSpecialistInfo = async () => {
    try {
      setLoadingSpecialist(true);
      const info = await specialistService.getSpecialistByUserId(userId);
      setSpecialistInfo({
        specialistId: info.specialistId,
        specialistType: info.specialistType,
        userId: info.userId,
      });
    } catch (error) {
      console.error("Error loading specialist info:", error);
      Alert.alert(
        t("manage.error"),
        t("manage.specialistProfileNotFound")
      );
    } finally {
      setLoadingSpecialist(false);
    }
  };


  const canManage = isSpecialist && user?.id === userId;

  const handleDelete = useCallback(() => {
    if (!onDelete) {
      Alert.alert(t("manage.error"), t("manage.deleteUnavailable"));
      return;
    }
    
    Alert.alert(
      t("manage.deleteTitle"),
      t("manage.deleteConfirm"),
      [
        { text: t("manage.cancel"), style: "cancel" },
        {
          text: t("manage.delete"),
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete();
              Alert.alert(t("manage.success"), t("manage.deleteSuccess"));
            } catch (error: any) {
              Alert.alert(
                t("manage.error"),
                error?.message || t("manage.deleteUnavailable"),
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [onDelete]);

  const handleLogout = useCallback(() => {
    Alert.alert(t("manage.logoutTitle"), t("manage.logoutConfirm"), [
      {
        text: t("manage.cancel"),
        style: "cancel",
      },
      {
        text: t("manage.exit"),
        onPress: async () => {
          try {
            await logout(); 
            router.replace("/login");
          } catch (error) {
            Alert.alert(t("manage.error"), t("manage.logoutFailed"));
          }
        },
      },
    ]);
  }, [router, logout]);

  const handleSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const getSpecialistTypeEnum = (): "VET" | "SERVICE" => {
    return specialistInfo?.specialistType || propSpecialistType || "VET";
  };

  const getAccountCardStyle = () => ({
    backgroundColor: colors.card?.default || colors.background.secondary,
    paddingVertical: 18,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border?.light || "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  });


  if (loadingSpecialist) {
    return (
      <View
        style={{
          padding: spacing.xl,
          alignItems: "center",
          marginTop: spacing.md,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text
          style={[
            typography.body2,
            { color: colors.text.secondary, marginTop: spacing.md },
          ]}
        >
          {t("manage.loadingSpecialist")}
        </Text>
      </View>
    );
  }


  if (!specialistInfo) {
    return (
      <View
        style={{
          padding: spacing.xl,
          alignItems: "center",
          backgroundColor: colors.background.tertiary,
          borderRadius: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.error?.main || "#F44336"}
        />
        <Text
          style={[
            typography.body1,
            {
              color: colors.text.primary,
              textAlign: "center",
              marginTop: spacing.sm,
            },
          ]}
        >
          {t("manage.specialistNotFound")}
        </Text>
        <Text
          style={[
            typography.caption,
            {
              color: colors.text.secondary,
              textAlign: "center",
              marginTop: spacing.xs,
            },
          ]}
        >
          {t("manage.specialistNotFoundMessage")}
        </Text>
      </View>
    );
  }


  if (!canManage) {
    return (
      <View
        style={{
          padding: spacing.xl,
          alignItems: "center",
          backgroundColor: colors.background.tertiary,
          borderRadius: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color={colors.text.tertiary}
        />
        <Text
          style={[
            typography.body1,
            {
              color: colors.text.primary,
              textAlign: "center",
              marginTop: spacing.sm,
            },
          ]}
        >
          {t('manage.noAccess')}
        </Text>
        <Text
          style={[
            typography.caption,
            {
              color: colors.text.secondary,
              textAlign: "center",
              marginTop: spacing.xs,
            },
          ]}
        >
          {t('manage.noAccessMessag')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ marginTop: spacing.md, paddingBottom: spacing.xl }}>

        <View
          style={{
            backgroundColor: colors.card?.default || colors.background.secondary,
            borderRadius: 20,
            padding: spacing.md,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border?.light || "#E5E5EA",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={[typography.body2, { color: colors.text.secondary }]}>
                {t("manage.specialistId")}
              </Text>
              <Text style={[typography.h4, { color: colors.text.primary, marginTop: spacing.xs }]}>
                {specialistInfo.specialistId}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[typography.body2, { color: colors.text.secondary }]}>
                {t("manage.specialistType")}
              </Text>
              <Text style={[typography.body1SemiBold, { color: colors.primary.main, marginTop: spacing.xs }]}>
                {specialistInfo.specialistType === "VET" ? t("manage.veterinarian") : t("manage.serviceProvider")}
              </Text>
            </View>
          </View>
        </View>


        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.h4, { color: colors.text.primary }]}>
            {t("manage.specialistCabinet")}
          </Text>
          <Text style={[typography.body2, { color: colors.text.secondary, marginTop: 4 }]}>
            {t("manage.specialistCabinetDescription")}
          </Text>
        </View>


        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg }}>

          <TouchableOpacity
            onPress={() => setActiveTab("schedule")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: activeTab === "schedule"
                ? colors.primary.main
                : colors.card?.default || colors.background.secondary,
              borderWidth: activeTab === "schedule" ? 0 : 1,
              borderColor: colors.border?.light || "#E5E5EA",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ alignItems: "center", gap: 8 }}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={activeTab === "schedule" ? colors.text.inverse : colors.primary.main}
              />
              <Text style={[typography.body1SemiBold, { color: activeTab === "schedule" ? colors.text.inverse : colors.text.primary }]}>
                t("manage.schedule")
              </Text>
              <Text style={[typography.caption, { color: activeTab === "schedule" ? colors.text.inverse + "CC" : colors.text.secondary, textAlign: "center" }]}>
                t("manage.scheduleDescription")
              </Text>
            </View>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => setActiveTab("slots")}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: activeTab === "slots"
                ? colors.primary.main
                : colors.card?.default || colors.background.secondary,
              borderWidth: activeTab === "slots" ? 0 : 1,
              borderColor: colors.border?.light || "#E5E5EA",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View style={{ alignItems: "center", gap: 8 }}>
              <Ionicons
                name="time-outline"
                size={24}
                color={activeTab === "slots" ? colors.text.inverse : colors.primary.main}
              />
              <Text style={[typography.body1SemiBold, { color: activeTab === "slots" ? colors.text.inverse : colors.text.primary }]}>
                t("manage.slots")
              </Text>
              <Text style={[typography.caption, { color: activeTab === "slots" ? colors.text.inverse + "CC" : colors.text.secondary, textAlign: "center" }]}>
                t("manage.slotsDescription")
              </Text>
            </View>
          </TouchableOpacity>
        </View>


        {activeTab === "schedule" && (
          <ScheduleForm
            initialUserId={userId}
            specialistType={getSpecialistTypeEnum()}
            onSuccess={() => {
              Alert.alert(t("manage.success"), t("manage.scheduleSaved"));
            }}
          />
        )}

        {activeTab === "slots" && (
          <SlotManagement
            userId={userId}
            specialistType={specialistInfo.specialistType}
            isOwner={true}
          />
        )}


        <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
          <Text style={[typography.h4, { color: colors.text.primary }]}>
            t("manage.account")
          </Text>
          <Text style={[typography.body2, { color: colors.text.secondary, marginTop: 4 }]}>
            t("manage.accountDescription")
          </Text>
        </View>


        <TouchableOpacity
          onPress={handleSettings}
          activeOpacity={0.7}
          style={getAccountCardStyle()}
        >
          <Ionicons name="settings-outline" size={22} color={colors.primary.main} />
          <Text style={[typography.body1SemiBold, { flex: 1, marginLeft: 12, color: colors.text.primary }]}>
            t("manage.settings")
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </TouchableOpacity>


        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          style={getAccountCardStyle()}
        >
          <Ionicons name="log-out-outline" size={22} color="#F59E0B" />
          <Text style={[typography.body1SemiBold, { flex: 1, marginLeft: 12, color: colors.text.primary }]}>
            t("manage.logout")
          </Text>
        </TouchableOpacity>


        {onDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.error?.main || "#DC2626",
              paddingVertical: 18,
              paddingHorizontal: spacing.md,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: spacing.md,
              marginBottom: spacing.xl,
              opacity: deleting ? 0.7 : 1,
              borderWidth: 1,
              borderColor: colors.error?.light || "#FEE2E2",
            }}
          >
            {deleting ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={colors.text.inverse} />
                <Text style={[typography.button, { color: colors.text.inverse }]}>
                  t("manage.deleteProfile")
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};