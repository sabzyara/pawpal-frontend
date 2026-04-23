import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { useProfileStore } from '@/store/profileStore';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { profile, fetchProfile } = useProfileStore();

  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [extra, setExtra] = useState(''); // username / serviceCategory

  // 🔥 заполняем поля
  useEffect(() => {
    if (!profile) return;

    const role = profile.user.role;

    if (role === 'OWNER' && profile.petOwner) {
      setExtra(profile.petOwner.username || '');
      setPhone(profile.petOwner.phoneNumber || '');
    }

    if (role === 'VET' && profile.veterinarian) {
      setFirstName(profile.veterinarian.firstName || '');
      setLastName(profile.veterinarian.lastName || '');
      setPhone(profile.veterinarian.phoneNumber || '');
    }

    if (role === 'SERVICE' && profile.serviceProvider) {
      setFirstName(profile.serviceProvider.firstName || '');
      setLastName(profile.serviceProvider.lastName || '');
      setPhone(profile.serviceProvider.phoneNumber || '');
      setExtra(profile.serviceProvider.serviceCategory || '');
    }
  }, [profile]);

  // 🔥 SAVE
  const handleSave = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      const role = profile?.user.role;

      if (!token || !role) return;

      if (role === 'OWNER') {
        await api.put(
          '/pet-management/api/pet-owners/me',
          {
            username: extra,
            phoneNumber: phone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (role === 'VET') {
        await api.put(
          '/specialist-service/api/veterinarians/me',
          {
            firstName,
            lastName,
            phoneNumber: phone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (role === 'SERVICE') {
        await api.put(
          '/specialist-service/api/service-providers/me',
          {
            firstName,
            lastName,
            phoneNumber: phone,
            serviceCategory: extra,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchProfile();

      Alert.alert('Успех', 'Профиль обновлен');
      router.back();

    } catch (e: any) {
      console.log(e?.response?.data);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const role = profile?.user.role;

 return (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={styles.back}>← Back</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.title}>
          Edit Profile
        </ThemedText>
      </View>

      {/* FORM */}
      <View style={styles.form}>

        {(role === 'VET' || role === 'SERVICE') && (
          <>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </>
        )}

        {role === 'OWNER' && (
          <TextInput
            placeholder="Username"
            value={extra}
            onChangeText={setExtra}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        )}

        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />

        {role === 'SERVICE' && (
          <TextInput
            placeholder="Service Category"
            value={extra}
            onChangeText={setExtra}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        )}

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>
              Save Changes
            </ThemedText>
          )}
        </TouchableOpacity>

      </View>

    </ScrollView>
  </SafeAreaView>
);  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    gap: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#7A2E4D',
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // мягче
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 15,

    // ✨ легкая тень (очень важно)
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  button: {
    backgroundColor: '#7A2E4D',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,

    // ✨ чуть глубины
    shadowColor: '#7A2E4D',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});