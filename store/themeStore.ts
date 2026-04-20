import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',

  setTheme: async (theme) => {
    await AsyncStorage.setItem('theme', theme);
    set({ theme });
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      set({ theme: saved });
    }
  },
}));