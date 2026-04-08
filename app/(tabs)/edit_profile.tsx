// app/(tabs)/edit_profile.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <ScrollView>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText>← Back</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title">Edit Profile</ThemedText>
          <View style={{ width: 40 }} />
        </ThemedView>

        <ThemedView style={styles.form}>
          <ThemedText style={styles.label}>First Name</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
            placeholder="Enter your first name"
            placeholderTextColor={colors.text.tertiary}
          />
          
          <ThemedText style={styles.label}>Last Name</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
            placeholder="Enter your last name"
            placeholderTextColor={colors.text.tertiary}
          />
          
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
            placeholder="Enter your email"
            keyboardType="email-address"
            placeholderTextColor={colors.text.tertiary}
          />
          
          <ThemedText style={styles.label}>Phone Number</ThemedText>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            placeholderTextColor={colors.text.tertiary}
          />
          
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary.main }]}>
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
});