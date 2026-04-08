// styles/colors.ts
export const Colors = {
  light: {
    // Primary Colors
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
      gradient: ['#6366F1', '#8B5CF6'] as const,
    },
    secondary: {
      main: '#EC4899',
      light: '#F472B6',
      dark: '#DB2777',
      gradient: ['#EC4899', '#F472B6'] as const,
    },
    
    // Background Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      inverse: '#111827',
    },
    
    // Text Colors
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
      disabled: '#D1D5DB',
    },
    
    // Status Colors
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      successLight: '#D1FAE5',
      warningLight: '#FEF3C7',
      errorLight: '#FEE2E2',
      infoLight: '#DBEAFE',
    },
    
    // Border Colors
    border: {
      light: '#E5E7EB',
      medium: '#D1D5DB',
      dark: '#9CA3AF',
      focus: '#6366F1',
    },
    
    // Shadow Colors
    shadow: {
      light: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      dark: 'rgba(0, 0, 0, 0.15)',
      heavy: 'rgba(0, 0, 0, 0.2)',
    },
    
    // Card Colors
    card: {
      default: '#FFFFFF',
      elevated: '#FFFFFF',
      pressed: '#F9FAFB',
    },
    
    // Input Colors
    input: {
      background: '#F9FAFB',
      border: '#E5E7EB',
      placeholder: '#9CA3AF',
      focused: '#6366F1',
    },
    
    // Icon Colors
    icon: {
      default: '#6B7280',
      active: '#6366F1',
      inactive: '#9CA3AF',
    },
  },
  
  dark: {
    // Primary Colors
    primary: {
      main: '#818CF8',
      light: '#A5B4FC',
      dark: '#6366F1',
      gradient: ['#818CF8', '#A78BFA'] as const,
    },
    secondary: {
      main: '#F472B6',
      light: '#F9A8D4',
      dark: '#EC4899',
      gradient: ['#F472B6', '#F9A8D4'] as const,
    },
    
    // Background Colors
    background: {
      primary: '#1F2937',
      secondary: '#111827',
      tertiary: '#374151',
      inverse: '#FFFFFF',
    },
    
    // Text Colors
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#111827',
      disabled: '#4B5563',
    },
    
    // Status Colors
    status: {
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',
      successLight: '#064E3B',
      warningLight: '#451A03',
      errorLight: '#7F1D1D',
      infoLight: '#1E3A8A',
    },
    
    // Border Colors
    border: {
      light: '#374151',
      medium: '#4B5563',
      dark: '#6B7280',
      focus: '#818CF8',
    },
    
    // Shadow Colors (darker for dark mode)
    shadow: {
      light: 'rgba(0, 0, 0, 0.2)',
      medium: 'rgba(0, 0, 0, 0.3)',
      dark: 'rgba(0, 0, 0, 0.4)',
      heavy: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Card Colors
    card: {
      default: '#1F2937',
      elevated: '#374151',
      pressed: '#111827',
    },
    
    // Input Colors
    input: {
      background: '#374151',
      border: '#4B5563',
      placeholder: '#6B7280',
      focused: '#818CF8',
    },
    
    // Icon Colors
    icon: {
      default: '#D1D5DB',
      active: '#818CF8',
      inactive: '#6B7280',
    },
  },
};

// Type exports
export type ThemeColors = typeof Colors.light;
export type ThemeType = keyof typeof Colors;
export type ColorKey = keyof ThemeColors;