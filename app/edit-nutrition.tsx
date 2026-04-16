import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { router, Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddNutritionScreen() {
  const { colors } = useTheme();
  <Stack.Screen options={{ headerShown: false }} />
  
  return (
    <SafeAreaView style={[{ flex: 1 }, styles.container, { backgroundColor: colors.background.secondary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Add Nutrition</ThemedText>
          <View style={{ width: 40 }} />
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedText style={styles.label}>Meal Type</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
            placeholder="Enter type of meal"
            placeholderTextColor={colors.text.tertiary}
          />
          
          <ThemedText style={styles.label}>Calories</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
            placeholder="Enter how many calories the meal consists of"
            placeholderTextColor={colors.text.tertiary}
          />
          
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary.main }]}>
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
  padding: 16,
  paddingBottom: 20, 
},
});