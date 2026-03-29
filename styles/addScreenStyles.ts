import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const colors = {
  primary: "#9AAB63",
  secondary: "#F5B8DB",
  tertiary: "#B6CAEB",
  accent: "#F5D867",
  background: "#FBF4E6",
  white: "#FFFFFF",
  black: "#333333",
  gray: "#999999",
  error: "#FF6B6B",
  success: "#9AAB63",
  overlay: "rgba(0, 0, 0, 0.5)",
};

export const addScreenStyles = StyleSheet.create({
  // Затемненный фон
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Центральная карточка
  modalCard: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.85,
    backgroundColor: colors.background,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  
  // Кнопка закрытия
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
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
  closeIconText: {
    fontSize: 18,
    color: colors.gray,
    fontWeight: "600",
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Header внутри карточки
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.tertiary,
    backgroundColor: colors.white,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
  },
  
  // Form
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  required: {
    color: colors.error,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.black,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.black,
    minHeight: 80,
    textAlignVertical: "top",
  },
  
  // Gender
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.tertiary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 14,
    color: colors.black,
  },
  genderTextActive: {
    color: colors.white,
    fontWeight: "600",
  },
  
  // Row
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
  },
  halfWidth: {
    flex: 1,
  },
  
  // Buttons
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.white,
  },
});