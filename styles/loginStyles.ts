import { ThemeColors } from '@/styles/colors';
import { StyleSheet } from 'react-native';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      height: 260,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },

    logoWrapper: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.card.default,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,

      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 6,
    },

    logo: {
      width: 70,
      height: 70,
    },

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text.inverse,
    },

    subtitle: {
      fontSize: 14,
      color: colors.text.inverse,
      opacity: 0.8,
      textAlign: 'center',
    },

    form: {
      backgroundColor: colors.card.default,
      borderRadius: 20,
      padding: 20,

      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 6,
    },

    input: {
      backgroundColor: colors.input.background,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      fontSize: 16,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.input.border,
    },

    passwordContainer: {
      position: 'relative',
    },

    eye: {
      position: 'absolute',
      right: 15,
      top: 18,
    },

    button: {
      backgroundColor: colors.primary.main,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },

    buttonText: {
      color: colors.text.inverse,
      fontWeight: 'bold',
      fontSize: 16,
    },

    registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },

    registerText: {
      color: colors.text.secondary,
    },

    registerLink: {
      color: colors.primary.main,
      fontWeight: '600',
    },

    errorBox: {
      backgroundColor: colors.primary.light + '20',
      padding: 10,
      borderRadius: 10,
      marginBottom: 15,
    },

    errorText: {
      color: colors.primary.main,
      textAlign: 'center',
    },
  });