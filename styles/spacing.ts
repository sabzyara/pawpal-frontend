export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  screenPadding: 20,
  cardPadding: 16,
  inputPadding: 12,
  buttonPadding: 12,
  
  marginHorizontal: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  
  marginVertical: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
  },
  
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  avatar: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 96,
  },
  
  button: {
    sm: 32,
    md: 44,
    lg: 52,
  },
  
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },
} as const;

export type SpacingKey = keyof typeof Spacing;