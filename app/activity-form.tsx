import api from "@/services/api";
import { useTheme } from "@/hooks/useTheme";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import "./i18n";
import { useTranslation } from 'react-i18next';

export default function ActivityForm() {
  const { petId } = useLocalSearchParams();
  const { t } = useTranslation();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [activityType, setActivityType] = useState("");
  const [distanceValue, setDistanceValue] = useState("");
  const [durationValue, setDurationValue] = useState("");

  const translateY = useRef(new Animated.Value(500)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: 250,
        useNativeDriver: true,
      }),

      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => router.back());
  };

  const handleSave = async () => {
    try {
      await api.post("/pet-management/api/activities", {
        petId: Number(petId),
        date: new Date().toISOString().split("T")[0],

        activityType,
        distance: Number(distanceValue),
        durationInMinutes: Number(durationValue),
      });

      handleClose();
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <>
    

      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.overlayBg,
            {
              opacity: overlayOpacity,
            },
          ]}
        />
      </TouchableOpacity>

      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View
              {...panResponder.panHandlers}
              style={styles.handle}
            />

            <View style={styles.header}>
              <Text style={styles.title}>{t('tracker.Add Activity')}</Text>

              <Text style={styles.subtitle}>
                {t('tracker.Track your pet’s daily activity')}
              </Text>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.form}>

                <Text style={styles.label}>{t('tracker.Activity Type')}</Text>

                <TextInput
                  value={activityType}
                  onChangeText={setActivityType}
                  style={styles.input}
                  placeholder="Walk"
                  placeholderTextColor={colors.text.secondary}
                />

                <Text style={styles.label}>{t('tracker.Distance')}</Text>

                <TextInput
                  value={distanceValue}
                  onChangeText={setDistanceValue}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="2.5 km"
                  placeholderTextColor={colors.text.secondary}
                />

                <Text style={styles.label}>{t('tracker.Duration')}</Text>

                <TextInput
                  value={durationValue}
                  onChangeText={setDurationValue}
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="45 minutes"
                  placeholderTextColor={colors.text.secondary}
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {t('tracker.Add Activity')}
                  </Text>
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      color: colors.text.primary,
    },

    subtitle: {
      color: colors.text.secondary,
      textAlign: "center",
      marginTop: 6,
      fontSize: 14,
    },

    container: {
      flex: 1,
      justifyContent: "flex-end",
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
    },

    overlayBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },

    sheet: {
      paddingTop: 14,
      paddingBottom: 30,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      minHeight: "58%",
      backgroundColor: colors.background.primary,
    },

    handle: {
      width: 52,
      height: 5,
      backgroundColor: colors.border.medium,
      borderRadius: 10,
      alignSelf: "center",
      marginBottom: 18,
    },

    header: {
      alignItems: "center",
      paddingBottom: 10,
    },

    form: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },

    label: {
      marginTop: 18,
      marginBottom: 6,
      color: colors.text.secondary,
      fontSize: 13,
      fontWeight: "500",
    },

    input: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 18,

      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderColor: colors.input.border,

      color: colors.text.primary,
      fontSize: 15,
    },

    saveButton: {
      padding: 18,
      borderRadius: 20,
      alignItems: "center",
      marginTop: 34,
      marginBottom: 10,
      backgroundColor: colors.primary.main,
    },

    saveButtonText: {
      color: colors.text.inverse,
      fontWeight: "700",
      fontSize: 16,
    },
  });