import { ThemeColors } from '@/styles/colors';
import { StyleSheet } from 'react-native';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background.primary,
      justifyContent: 'center',
      gap: 10,
    },

    title: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 10,
      color: colors.primary.main,
      textAlign: 'center',
    },

    input: {
      borderWidth: 1,
      borderColor: colors.input.border,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.input.background,
      color: colors.text.primary,
    },

    button: {
      backgroundColor: colors.primary.main,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },

    buttonText: {
      color: colors.text.inverse,
      fontWeight: '600',
    },
  });