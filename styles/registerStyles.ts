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
      flexDirection: "row",
      alignItems: "center",
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
          shadowColor: "#000",
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
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text.primary,
      flex: 1,
    },

    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 5,
    },

    // ROLE CARD
    roleCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card.default,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border.light,

      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },

    roleName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 4,
    },

    roleDescription: {
      fontSize: 12,
      color: colors.text.secondary,
    },

    roleArrow: {
      fontSize: 24,
      color: colors.text.tertiary,
    },

    // FORM
    form: {
      marginTop: 10,
    },

    errorContainer: {
      backgroundColor: colors.primary.light + "20",
      borderRadius: 12,
      padding: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.primary.main,
    },

    errorText: {
      color: colors.primary.main,
      fontSize: 14,
      textAlign: "center",
    },

    inputGroup: {
      marginBottom: 16,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 8,
    },

    input: {
      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderColor: colors.input.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text.primary,
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
      borderWidth: 1,
      borderColor: colors.border.medium,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },

    categoryButtonActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
    },

    categoryText: {
      fontSize: 14,
      color: colors.text.primary,
    },

    categoryTextActive: {
      color: colors.text.inverse,
      fontWeight: "600",
    },

    registerButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 20,
      marginBottom: 16,

      ...Platform.select({
        ios: {
          shadowColor: colors.primary.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },

    registerButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text.inverse,
    },

     roleIcon: {
      fontSize: 40,
      marginRight: 16,
    },

    loginLink: {
      alignItems: "center",
      paddingVertical: 12,
    },

    loginLinkText: {
      fontSize: 14,
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
  });