import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const addPetStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  keyboardView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  placeholder: {
    width: 40,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarText: {
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
    fontWeight: "500",
  },

  // Welcome Card
  welcomeCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    textAlign: "center",
  },

  // Form Section
  formSection: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 20,
  },

  inputWrapper: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  required: {
    color: "#FF6B6B",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },

  // Gender Selection
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 16,
  },
  genderGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    position: "relative",
  },
  genderEmoji: {
    fontSize: 20,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  genderTextActive: {
    color: "#FFF",
  },
  genderButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkmark: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  // Buttons
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  saveButton: {
    flex: 2,
    overflow: "hidden",
    borderRadius: 16,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
});