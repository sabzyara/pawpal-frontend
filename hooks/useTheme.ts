import { useColorScheme } from './use-color-scheme';
import { Colors } from '@/styles';
import { Typography } from '@/styles';
import { Spacing } from '@/styles/spacing';
import { Shadows } from '@/styles/shadows';
import { Animations } from '@/styles/animations';
import { ThemeType, ThemeColors } from '@/styles/colors';

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
  const scheme = useColorScheme();
  const theme = (scheme === 'dark' ? 'dark' : 'light') as ThemeType;
  const colors = Colors[theme];
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return {
    theme,
    colors: colors as ThemeColors,
    typography: Typography,
    spacing: Spacing,
    shadows: Shadows,
    animations: Animations,
    isDark,
    isLight,
  };
};