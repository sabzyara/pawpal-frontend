// styles/global.ts
import { StyleSheet } from 'react-native';
import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';

export const createGlobalStyles = (theme: 'light' | 'dark') => {
  const colors = Colors[theme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    
    contentContainer: {
      padding: Spacing.md,
    },
    
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    rowAround: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    column: {
      flexDirection: 'column',
    },
    
    card: {
      backgroundColor: colors.card.default,
      borderRadius: Spacing.radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      shadowColor: colors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    
    cardElevated: {
      backgroundColor: colors.card.elevated,
      borderRadius: Spacing.radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      shadowColor: colors.shadow.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    
    divider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginVertical: Spacing.md,
    },
    
    input: {
      backgroundColor: colors.input.background,
      borderRadius: Spacing.radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      fontSize: Typography.body1.fontSize,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.input.border,
    },
    
    inputFocused: {
      borderColor: colors.input.focused,
      borderWidth: 2,
    },
    
    inputError: {
      borderColor: colors.status.error,
      borderWidth: 1,
    },
    
    button: {
      borderRadius: Spacing.radius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    buttonPrimary: {
      backgroundColor: colors.primary.main,
    },
    
    buttonSecondary: {
      backgroundColor: colors.secondary.main,
    },
    
    buttonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary.main,
    },
    
    buttonText: {
      color: colors.text.inverse,
      ...Typography.button,
    },
    
    buttonOutlineText: {
      color: colors.primary.main,
      ...Typography.button,
    },
    
    // Text styles
    textPrimary: {
      color: colors.text.primary,
    },
    
    textSecondary: {
      color: colors.text.secondary,
    },
    
    textError: {
      color: colors.status.error,
    },
    
    textSuccess: {
      color: colors.status.success,
    },
    
    mt1: { marginTop: Spacing.xs },
    mt2: { marginTop: Spacing.sm },
    mt3: { marginTop: Spacing.md },
    mt4: { marginTop: Spacing.lg },
    mt5: { marginTop: Spacing.xl },
    
    mb1: { marginBottom: Spacing.xs },
    mb2: { marginBottom: Spacing.sm },
    mb3: { marginBottom: Spacing.md },
    mb4: { marginBottom: Spacing.lg },
    mb5: { marginBottom: Spacing.xl },
    
    ml1: { marginLeft: Spacing.xs },
    ml2: { marginLeft: Spacing.sm },
    ml3: { marginLeft: Spacing.md },
    ml4: { marginLeft: Spacing.lg },
    ml5: { marginLeft: Spacing.xl },
    
    mr1: { marginRight: Spacing.xs },
    mr2: { marginRight: Spacing.sm },
    mr3: { marginRight: Spacing.md },
    mr4: { marginRight: Spacing.lg },
    mr5: { marginRight: Spacing.xl },
    
    pt1: { paddingTop: Spacing.xs },
    pt2: { paddingTop: Spacing.sm },
    pt3: { paddingTop: Spacing.md },
    pt4: { paddingTop: Spacing.lg },
    pt5: { paddingTop: Spacing.xl },
    
    pb1: { paddingBottom: Spacing.xs },
    pb2: { paddingBottom: Spacing.sm },
    pb3: { paddingBottom: Spacing.md },
    pb4: { paddingBottom: Spacing.lg },
    pb5: { paddingBottom: Spacing.xl },
    
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    flex3: { flex: 3 },
    flexGrow1: { flexGrow: 1 },
    
    absoluteFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    
    roundedSM: { borderRadius: Spacing.radius.sm },
    roundedMD: { borderRadius: Spacing.radius.md },
    roundedLG: { borderRadius: Spacing.radius.lg },
    roundedXL: { borderRadius: Spacing.radius.xl },
    roundedFull: { borderRadius: Spacing.radius.round },
  });
};