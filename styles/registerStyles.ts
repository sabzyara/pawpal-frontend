import { StyleSheet, Platform } from "react-native";
import { colors } from "./loginStyles";

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  
  // Header
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
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
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
    color: colors.primary,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 5,
  },
  
  // Role Cards
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  roleIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: colors.gray,
  },
  roleArrow: {
    fontSize: 24,
    color: colors.tertiary,
  },
  
  // Form
  form: {
    marginTop: 10,
  },
  errorContainer: {
    backgroundColor: colors.error + "20",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.black,
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
  
  // Row for two columns
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  
  // Category buttons for SERVICE
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 5,
  },
  categoryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.black,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  
  // Buttons
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
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
    color: colors.white,
  },
  
  // Login link
  loginLink: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  
  // Back button on role selection
  backButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 20,
    marginHorizontal: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.gray,
  },
});