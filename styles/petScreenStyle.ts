import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const petProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  coverPhoto: {
    width: width,
    height: 180,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    overflow: "hidden",
    borderRadius: 20,
  },
  editGradient: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: {
    marginTop: -60,
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFF",
    backgroundColor: "#FFF",
  },
  genderBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  petName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 8,
  },
  breedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  breedText: {
    fontSize: 14,
    color: "#666",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "#FFF0F0",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  tabTextActive: {
    color: "#FF6B6B",
  },

  // Info Tab
  infoSection: {
    paddingHorizontal: 20,
  },
  healthCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  healthText: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },

  // Actions Grid
  actionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    overflow: "hidden",
    borderRadius: 16,
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  // Health Tab
  healthSection: {
    paddingHorizontal: 20,
  },
  vaccinationsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vaccineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  vaccineStatus: {
    width: 32,
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  vaccineDate: {
    fontSize: 12,
    color: "#999",
  },
  weightCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  weightChart: {
    marginTop: 12,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#4ECDC4",
    marginBottom: 12,
  },
  weightBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  weightProgress: {
    height: "100%",
    borderRadius: 4,
  },
  weightNote: {
    fontSize: 12,
    color: "#999",
  },
  medicalCard: {
    overflow: "hidden",
    borderRadius: 20,
    marginBottom: 20,
  },
  medicalGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  medicalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  medicalSubtitle: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.9,
  },

  // Appointments Tab
  appointmentsSection: {
    paddingHorizontal: 20,
  },
  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentStatus: {
    marginRight: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  appointmentDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  appointmentType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  appointmentTypeText: {
    fontSize: 12,
    color: "#999",
  },
  bookButton: {
    marginTop: 12,
    marginBottom: 20,
    overflow: "hidden",
    borderRadius: 16,
  },
  bookGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  bookText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },

  // Delete Button
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginTop: 20,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  modalBody: {
    padding: 20,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalSaveButton: {
    marginTop: 20,
    marginBottom: 40,
    overflow: "hidden",
    borderRadius: 16,
  },
  modalSaveGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },

  bottomSpacing: {
    height: 40,
  },
});