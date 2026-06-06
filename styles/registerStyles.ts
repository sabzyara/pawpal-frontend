import { ThemeColors } from "@/styles/colors";
import { Platform, StyleSheet } from "react-native";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 30,
    },

    // HEADER
    header: {
      flexDirection: "column",
      alignItems: "flex-start",
      marginBottom: 30,
      paddingHorizontal: 10,
    },

    backIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card.default,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary.dark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },

    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 4,
    },

    // ROLE CARD
    roleCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card.default,
      borderRadius: 20,
      padding: 20,
      marginBottom: 14,
      marginHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary.dark,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },

    roleIcon: {
      fontSize: 44,
      marginRight: 16,
    },

    roleContent: {
      flex: 1,
    },

    roleName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },

    roleDescription: {
      fontSize: 13,
      color: colors.text.secondary,
    },

    roleArrow: {
      fontSize: 24,
      color: colors.primary.light,
    },

    // FORM
    form: {
      marginTop: 10,
    },

    errorContainer: {
      backgroundColor: colors.error.light,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.error.main,
    },

    errorText: {
      color: colors.error.dark,
      fontSize: 14,
      textAlign: "center",
      fontWeight: "500",
    },

    inputGroup: {
      marginBottom: 20,
    },

    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },

    input: {
      backgroundColor: colors.input.background,
      borderWidth: 1.5,
      borderColor: colors.input.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary.light,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },

    passwordContainer: {
      position: "relative",
    },

    passwordInput: {
      paddingRight: 50,
    },

    eyeButton: {
      position: "absolute",
      right: 16,
      top: 14,
    },

    // ROW
    row: {
      flexDirection: "row",
      gap: 12,
    },

    halfWidth: {
      flex: 1,
    },

    // CATEGORY
    categoryContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 5,
    },

    categoryButton: {
      backgroundColor: colors.card.default,
      borderWidth: 1.5,
      borderColor: colors.border.medium,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },

    categoryButtonActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },

    categoryText: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: "500",
    },

    categoryTextActive: {
      color: colors.text.inverse,
      fontWeight: "600",
    },

    registerButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 20,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        android: {
          elevation: 5,
        },
      }),
    },

    registerButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text.inverse,
    },

    loginLink: {
      alignItems: "center",
      paddingVertical: 14,
    },

    loginLinkText: {
      fontSize: 15,
      color: colors.primary.main,
      fontWeight: "600",
    },

    backButton: {
      alignItems: "center",
      paddingVertical: 16,
      marginTop: 20,
      marginHorizontal: 10,
    },

    backButtonText: {
      fontSize: 16,
      color: colors.text.secondary,
    },

    // Дополнительные стили для выбранной роли
    selectedRoleBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background.secondary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 24,
      marginTop: 12,
      alignSelf: "center",
      borderWidth: 1,
      borderColor: colors.border.medium,
    },

    selectedRoleIcon: {
      fontSize: 20,
      marginRight: 8,
    },

    selectedRoleText: {
      fontSize: 14,
      color: colors.primary.main,
      fontWeight: "600",
    },

    // Стиль для кнопки "Назад" с иконкой
    backButtonIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.secondary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    buttonDisabled: {
  opacity: 0.6,
},
  });