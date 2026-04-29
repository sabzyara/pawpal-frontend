import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { useThemeStore } from '@/store/themeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  const [notifications, setNotifications] = useState(true);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const darkMode = theme === 'dark';

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удалить аккаунт?',
      'Это действие нельзя отменить',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');

              await api.delete('/user-service/users/me', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              await AsyncStorage.removeItem('token');
              router.replace('/login');
            } catch (e: any) {
              console.log(e?.response?.data);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedText style={[styles.header, { color: colors.text.primary }]}>
        Settings
      </ThemedText>

      <Section title="Preferences" styles={styles}>
        <SwitchItem
          title="Dark Mode"
          value={darkMode}
          onValueChange={(value: boolean) =>
            setTheme(value ? 'dark' : 'light')
          }
          colors={colors}
        />

        <SwitchItem
          title="Notifications"
          value={notifications}
          onValueChange={setNotifications}
          colors={colors}
        />
      </Section>

      <Section title="Account" styles={styles}>
        <Item
          title="Delete Account"
          danger
          onPress={handleDeleteAccount}
          styles={styles}
        />
      </Section>

      <Section title="About" styles={styles}>
        <Item title="Privacy Policy" styles={styles} />
        <Item title="App Version 1.0.0" styles={styles} />
      </Section>
    </SafeAreaView>
  );
}

function Section({ title, children, styles }: any) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Item({ title, onPress, danger, styles }: any) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <ThemedText
        style={[
          styles.itemText,
          danger && styles.dangerText,
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

function SwitchItem({ title, value, onValueChange, colors }: any) {
  return (
    <View style={stylesStatic.item}>
      <ThemedText
        style={[
          stylesStatic.itemText,
          { color: colors.text.primary }
        ]}
      >
        {title}
      </ThemedText>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border.light,
          true: colors.primary.main,
        }}
        thumbColor="#fff"
      />
    </View>
  );
}

const stylesStatic = StyleSheet.create({
  item: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 15,
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background.secondary,
    },

    header: {
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
      color: colors.primary.main,
    },

    section: {
      marginBottom: 20,
    },

    sectionTitle: {
      marginBottom: 8,
      fontSize: 13,
      color: colors.text.secondary,
    },

    card: {
      borderRadius: 16,
      backgroundColor: colors.card.default,
      overflow: 'hidden',

      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },

    item: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },

    itemText: {
      fontSize: 15,
      color: colors.text.primary,
    },

    dangerText: {
      color: '#E53935',
      fontWeight: '600',
    },
  });
