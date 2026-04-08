import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // Container
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header Section
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 10 : 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "Roboto",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "Roboto",
  },
  notificationIcon: {
    position: "relative",
    padding: 8,
    backgroundColor: "#FFF",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },

  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
    opacity: 0.9,
    fontWeight: "500",
  },

  // Section Common
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },

  // Calendar Section
  calendarSection: {
    marginBottom: 28,
  },
  calendarRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
  },
  dayCard: {
    width: 70,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayCardActive: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  dayTextActive: {
    color: "#FFF",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  dateTextActive: {
    color: "#FFF",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF6B6B",
  },

  // Pets Section
  petsSection: {
    marginBottom: 28,
  },
  petCard: {
    width: 110,
    alignItems: "center",
    padding: 12,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  petImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: "#FF6B6B",
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  petName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  petStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ECDC4",
  },
  petStatusText: {
    fontSize: 10,
    color: "#999",
  },

  // Schedule Section
  scheduleSection: {
    marginBottom: 28,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  completedCard: {
    opacity: 0.7,
  },
  scheduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#FFF",
  },
  scheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  scheduleTime: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.9,
    marginBottom: 2,
  },
  schedulePet: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.8,
  },
  chevron: {
    opacity: 0.8,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    backgroundColor: "#FFF",
    borderRadius: 24,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  addTaskButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
  },
  addTaskText: {
    color: "#FFF",
    fontWeight: "600",
  },

  // Learn Card
  learnCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  learnContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  learnTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
  },
  learnSubtitle: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.9,
  },
});