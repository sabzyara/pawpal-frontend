// screens/home/styles/homeStyles.ts
import { StyleSheet } from 'react-native';
import { ThemeColors } from '@/styles/colors';

export const createHomeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    flex: 1,
  },

  // ========== HEADER STYLES ==========
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // ========== STATS CARDS ==========
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '500',
  },

  // ========== SECTION COMMON ==========
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },

  // ========== CALENDAR SECTION ==========
  calendarSection: {
    marginBottom: 24,
  },
  calendarScrollContent: {
    paddingHorizontal: 16,
  },
  dayCard: {
    width: 70,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    position: 'relative',
  },
  dayCardActive: {
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dayTextActive: {
    color: '#FFF',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dateTextActive: {
    color: '#FFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 30,
    height: 3,
    backgroundColor: '#FFF',
    borderRadius: 2,
  },

  // ========== PETS SECTION ==========
  petsSection: {
    marginBottom: 24,
  },
  petsListContent: {
    paddingHorizontal: 16,
  },
  petCard: {
    width: 120,
    marginHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  petImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: colors.primary.light,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  petStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ECDC4',
  },
  petStatusText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  emptyPetsCard: {
    marginHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  emptyPetsText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  // ========== SCHEDULE SECTION ==========
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    opacity: 0.7,
  },
  scheduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#FFF',
  },
  scheduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  scheduleTime: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 2,
  },
  schedulePet: {
    fontSize: 11,
    color: '#FFF',
    opacity: 0.7,
  },
  chevron: {
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginHorizontal: 20,
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '500',
  },
  addTaskButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary.main,
    borderRadius: 12,
  },
  addTaskText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // ========== LEARN CARD ==========
  learnCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  learnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learnTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  learnSubtitle: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
  },
});