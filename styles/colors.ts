// styles/colors.ts

export const Colors = {
  light: {
    primary: {
      main: '#E3275B',
      light: '#EE819F',
      dark: '#B01946',
      gradient: ['#E3275B', '#F4AEC1'] as const,
    },
    secondary: {
      main: '#F4AEC1',
      light: '#FADBE3',
      dark: '#E85A7D',
      gradient: ['#F4AEC1', '#FADBE3'] as const,
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#FFF5F7',
      tertiary: '#FADBE3',
      inverse: '#1A1A1A',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#8A8A8A',
      tertiary: '#B0B0B0',
      inverse: '#FFFFFF',
      disabled: '#D1D5DB',
    },
    border: {
      light: '#FADBE3',
      medium: '#F4AEC1',
      dark: '#E85A7D',
      focus: '#E3275B',
    },
    card: {
      default: '#FFFFFF',
      elevated: '#FFF5F7',
      pressed: '#FADBE3',
    },
    input: {
      background: '#FFF5F7',
      border: '#FADBE3',
      placeholder: '#B0B0B0',
      focused: '#E3275B',
    },
    icon: {
      default: '#8A8A8A',
      active: '#E3275B',
      inactive: '#B0B0B0',
    },
    tracker: {
      primary: '#E3275B',
      secondary: '#F4AEC1',
      accent: '#EE819F',
    },
  },

  dark: {
    primary: {
      main: '#7B2CBF',
      light: '#9D4EDD',
      dark: '#5A189A',
      gradient: ['#7B2CBF', '#3A0CA3'] as const,
    },
    secondary: {
      main: '#3A0CA3',
      light: '#5A189A',
      dark: '#240046',
      gradient: ['#3A0CA3', '#5A189A'] as const,
    },
    background: {
      primary: '#000823',
      secondary: '#0B0F2B',
      tertiary: '#1A1F3A',
      inverse: '#FFFFFF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CFCFFF',
      tertiary: '#A0A0D0',
      inverse: '#000823',
      disabled: '#555577',
    },
    border: {
      light: '#1A1F3A',
      medium: '#2E2E5E',
      dark: '#444477',
      focus: '#9D4EDD',
    },
    card: {
      default: '#0B0F2B',
      elevated: '#1A1F3A',
      pressed: '#000823',
    },
    input: {
      background: '#1A1F3A',
      border: '#2E2E5E',
      placeholder: '#7777AA',
      focused: '#9D4EDD',
    },
    icon: {
      default: '#CFCFFF',
      active: '#9D4EDD',
      inactive: '#7777AA',
    },
    tracker: {
      primary: '#7B2CBF',
      secondary: '#3A0CA3',
      accent: '#9D4EDD',
    },
  },
} as const;

// 🔥 ВАЖНО — добавь это:
export type ThemeType = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeType];