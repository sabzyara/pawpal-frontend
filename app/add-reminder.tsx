import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/registerStyles";
import { router } from "expo-router";
import React, { useState } from "react";
import { useProfileStore }
from "@/store/profileStore";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import api from "@/services/api";
import "./i18n";
import {useTranslation} from "react-i18next";


export default function AddReminderScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const registerStyles = createStyles(colors);
  const { profile } =
  useProfileStore();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [type, setType] = useState(
    "FEEDING_REMINDER"
  );

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const types = [
    {
      label: "Feeding",
      value: "FEEDING_REMINDER",
    },
    {
      label: "Walk",
      value: "WALK_REMINDER",
    },
    {
      label: "Medical",
      value: "MEDICAL_REMINDER",
    },
  ];

const handleCreateReminder = async () => {

  try {

    if (
      !title ||
      !message ||
      !date ||
      !time
    ) {

      Alert.alert(
        t("addReminder.Error"),
        t("addReminder.Fill all fields")
      );

      return;
    }

    const formattedDate =
      date
        .split(".")
        .reverse()
        .join("-");

    const scheduledAt =
      `${formattedDate}T${time}:00`;

    console.log({
      userId:
        profile?.user.id,

      type,
      title,
      message,
      scheduledAt,
    });

    await api.post(
      "/notification-service/api/reminders",
      {
        userId:
          profile?.user.id,

        type,
        title,
        message,
        scheduledAt,
      }
    );

    Alert.alert(
      t("addReminder.Success"),
      t("addReminder.Reminder created")
    );

    router.back();

  } catch (e: any) {

    console.log(
      "CREATE ERROR:",
      e?.response?.data
    );

    console.log(
      "STATUS:",
      e?.response?.status
    );

    Alert.alert(
      t("addReminder.Error"),
      t("addReminder.Fill all fields")
    );
  }
};

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          colors.background.primary,
      }}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 60,
          }}
          keyboardShouldPersistTaps="handled"
        >


          <View
            style={{
              marginBottom: 30,
              marginTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color:
                    colors.text.secondary,
                }}
              >
                {t("addReminder.← Back")}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.title,
                {
                  color:
                    colors.text.primary,
                },
              ]}
            >
              {t("addReminder.title")}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.text.secondary,
                },
              ]}
            >
              {t("addReminder.subtitle")}
            </Text>
          </View>


          <Text
            style={[
              registerStyles.label,
              {
                marginBottom: 12,
              },
            ]}
          >
            {t("addReminder.Reminder Type")}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {types.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() =>
                  setType(item.value)
                }
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      type === item.value
                        ? colors.primary.main
                        : colors.card.elevated,

                    borderColor:
                      type === item.value
                        ? colors.primary.main
                        : colors.border.light,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      type === item.value
                        ? "white"
                        : colors.text.primary,

                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


          <View
            style={registerStyles.inputGroup}
          >
            <Text
              style={registerStyles.label}
            >
              {t("addReminder.Title")}
            </Text>

            <TextInput
              style={registerStyles.input}
              placeholder="Reminder title"
              placeholderTextColor={
                colors.text.tertiary
              }
              value={title}
              onChangeText={setTitle}
            />
          </View>


          <View
            style={registerStyles.inputGroup}
          >
            <Text
              style={registerStyles.label}
            >
              {t("addReminder.Message")}
            </Text>

            <TextInput
              style={[
                registerStyles.input,
                {
                  height: 110,
                  textAlignVertical: "top",
                  paddingTop: 16,
                },
              ]}
              multiline
              placeholder="Reminder message"
              placeholderTextColor={
                colors.text.tertiary
              }
              value={message}
              onChangeText={setMessage}
            />
          </View>


          <View
            style={registerStyles.inputGroup}
          >
            <Text
              style={registerStyles.label}
            >
              {t("addReminder.Date")}
            </Text>

            <TextInput
              style={registerStyles.input}
              placeholder="22.05.2026"
              placeholderTextColor={
                colors.text.tertiary
              }
              value={date}
              onChangeText={setDate}
            />
          </View>


          <View
            style={registerStyles.inputGroup}
          >
            <Text
              style={registerStyles.label}
            >
              {t("addReminder.Time")}
            </Text>

            <TextInput
              style={registerStyles.input}
              placeholder="18:00"
              placeholderTextColor={
                colors.text.tertiary
              }
              value={time}
              onChangeText={setTime}
            />
          </View>


          <TouchableOpacity
            style={[
              registerStyles.registerButton,
              {
                marginTop: 30,
              },
            ]}
            onPress={handleCreateReminder}
          >
            <Text
              style={
                registerStyles.registerButtonText
              }
            >
              {t("addReminder.createReminder")}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
  },

  typeButton: {
    flex: 1,

    paddingVertical: 14,

    borderRadius: 18,

    borderWidth: 1,

    alignItems: "center",
  },
});