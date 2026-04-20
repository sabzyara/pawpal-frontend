import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();

  const [darkMode, setDarkMode] = useState(isDark);
  const [notifications, setNotifications] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Settings
      </ThemedText>

      <Section title="Preferences">
        <SwitchItem
          title="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <SwitchItem
          title="Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />

      </Section>

      <Section title="Account">
        <Item title="Delete Account" danger onPress={() => console.log('delete')} />
      </Section>

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
      <ThemedText style={[styles.itemText, danger && { color: '#FF6B6B' }]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

function SwitchItem({ title, value, onValueChange }: any) {
  return (
    <View style={styles.item}>
      <ThemedText style={styles.itemText}>{title}</ThemedText>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'center',
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    marginBottom: 8,
    opacity: 0.7,
  },

  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  item: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  itemText: {
    fontSize: 16,
  },
});