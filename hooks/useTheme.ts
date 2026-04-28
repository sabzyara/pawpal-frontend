import { useThemeStore } from '@/store/themeStore';
import { Colors, Typography } from '@/styles';
import { Animations } from '@/styles/animations';
import { ThemeColors, ThemeType } from '@/styles/colors';
import { Shadows } from '@/styles/shadows';
import { Spacing } from '@/styles/spacing';
import { useColorScheme } from './use-color-scheme';

interface ThemeContext {
  theme: ThemeType;
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  shadows: typeof Shadows;
  animations: typeof Animations;
  isDark: boolean;
  isLight: boolean;
}

export const useTheme = (): ThemeContext => {
  const systemScheme = useColorScheme();

  const selectedTheme = useThemeStore((s) => s.theme);

  const theme: ThemeType =
    selectedTheme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : selectedTheme;

  const colors: ThemeColors = Colors[theme];

  return {
    theme,
    colors,
    typography: Typography,
    spacing: Spacing,
    shadows: Shadows,
    animations: Animations,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
};