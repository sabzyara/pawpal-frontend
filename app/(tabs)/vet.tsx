// app/(tabs)/vet.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';

export default function VetScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text>Veterinarian Screen</Text>
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