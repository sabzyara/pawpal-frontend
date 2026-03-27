import { StyleSheet } from "react-native";

export const colors = {
  primary: "#4CAF50",
  primaryDark: "#388E3C",
  accent: "#ff9800",
  background: "#f5f5f5",
  white: "#fff",
  black: "#000",
  gray: "#gray",
  grayLight: "#555",
  grayMedium: "#e3f2fd",
  success: "#4CAF50",
  warning: "#ff9800",
  textPrimary: "#000",
  textSecondary: "#555",
  textLight: "#fff",
  border: "#e0e0e0",
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 15,
  xxl: 20,
  xxxl: 30,
  tiny: 10,
  small: 14,
  medium: 16, // для средних отступов
  large: 18, // для больших отступов
};

export const typography = {
  title: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  small: {
    fontSize: 14,
  },
  extraSmall: {
    fontSize: 12,
  },
  tiny: {
    fontSize: 11,
  },
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 30,
  round: 999,
};

export const shadows = {
  small: {
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  medium: {
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
};

export const homeScreenStyles = StyleSheet.create({
  // Контейнеры
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xxl,
  },

  // Профиль пользователя
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
  },
  userName: {
    marginLeft: spacing.xl,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
  },

  // Секции
  sectionTitle: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginBottom: spacing.md,
  },
  sectionTitleWithMargin: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: typography.subtitle.fontWeight,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },

  // Питомцы
  petsList: {
    marginBottom: spacing.sm,
  },
  petCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    minWidth: 100,
    alignItems: "center",
    ...shadows.medium,
  },
  petCardSelected: {
    backgroundColor: colors.primary,
  },
  petEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  petName: {
    fontWeight: "normal",
    color: colors.black,
  },
  petNameSelected: {
    fontWeight: "bold",
    color: colors.textLight,
  },
  selectedBadge: {
    fontSize: spacing.tiny,
    color: colors.textLight,
    marginTop: spacing.xs,
  },

  // Кнопка сброса фильтра
  resetFilterButton: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  resetFilterText: {
    color: colors.textLight,
    fontSize: spacing.tiny,
  },

  // Карточки событий
  eventCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...shadows.small,
  },
  eventTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
  },
  eventTime: {
    color: colors.gray,
    marginTop: spacing.xs,
  },
  eventPetName: {
    color: colors.primary,
    fontSize: typography.extraSmall.fontSize,
    marginTop: spacing.xs,
  },
  eventIcon: {
    fontSize: 24,
  },

  // Пустое состояние
  emptyState: {
    backgroundColor: colors.white,
    padding: spacing.xxxl,
    borderRadius: borderRadius.md,
    alignItems: "center",
    ...shadows.small,
  },
  emptyStateText: {
    fontSize: typography.small.fontSize,
    color: colors.gray,
  },

  // Специалисты
  specialistsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  specialistCard: {
    backgroundColor: colors.grayMedium,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    width: "48%",
    marginBottom: spacing.md,
    ...shadows.small,
  },
  specialistName: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  specialistDescription: {
    fontSize: typography.tiny.fontSize,
    color: colors.grayLight,
    marginTop: spacing.xs,
  },

  // Дополнительные
  bottomSpacing: {
    height: spacing.xxl,
  },
});
