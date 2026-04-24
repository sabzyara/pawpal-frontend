import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { colors } = useTheme();

  const [notifications, setNotifications] = useState(true);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const darkMode = theme === 'dark';

  // 🔥 DELETE ACCOUNT
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
  console.log('STATUS:', e?.response?.status);
  console.log('DATA:', e?.response?.data);
}
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        Settings
      </ThemedText>

      {/* PREFERENCES */}
      <Section title="Preferences">
        <SwitchItem
          title="Dark Mode"
          value={darkMode}
          onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
        />

        <SwitchItem
          title="Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
      </Section>

      {/* ACCOUNT */}
      <Section title="Account">
        <Item
          title="Delete Account"
          danger
          onPress={handleDeleteAccount}
        />
      </Section>

      {/* ABOUT */}
      <Section title="About">
        <Item title="Privacy Policy" onPress={() => {}} />
        <Item title="App Version 1.0.0" />
      </Section>
    </ThemedView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Item({ title, onPress, danger }: any) {
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

type SwitchItemProps = {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SwitchItem({ title, value, onValueChange }: SwitchItemProps) {
  return (
    <View style={styles.item}>
      <ThemedText style={styles.itemText}>{title}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#7A2E4D' }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F6FA',
  },

  title: {
    marginTop: 30,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#7A2E4D',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    marginBottom: 8,
    opacity: 0.6,
    fontSize: 13,
  },

  card: {
    borderRadius: 14,
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  item: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  itemText: {
    fontSize: 15,
  },

  dangerText: {
    color: '#E53935',
    fontWeight: '600',
  },
});
