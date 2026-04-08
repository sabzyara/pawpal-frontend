// app/(tabs)/tracker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export default function TrackerScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text>Activity Tracker Screen</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});