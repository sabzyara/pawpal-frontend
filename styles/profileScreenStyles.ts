import { StyleSheet, Platform } from "react-native";

export const colors = {
  primary: "#9AAB63",
  secondary: "#F5B8DB",
  tertiary: "#B6CAEB",
  accent: "#F5D867",
  background: "#FBF4E6",
  white: "#FFFFFF",
  black: "#333333",
  gray: "#999999",
  lightGray: "#F0F0F0",
  error: "#FF6B6B",
  success: "#9AAB63",
};

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
  },
  roleBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  roleIcon: {
    fontSize: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  
  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 15,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
  },
  
  // Info Section
  infoSection: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.black,
  },
  
  // Actions Section
  actionsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 12,
    paddingLeft: 4,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tertiary + "30",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  actionIconText: {
    fontSize: 22,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.gray,
  },
  actionArrow: {
    fontSize: 18,
    color: colors.gray,
  },
  logoutCard: {
    backgroundColor: colors.error + "10",
  },
  logoutText: {
    color: colors.error,
  },
  
  // Loading & Error
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  
  bottomSpacing: {
    height: 30,
  },
});