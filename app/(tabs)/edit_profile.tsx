import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { useProfileStore } from '@/store/profileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
const { profile, fetchProfile } = useProfileStore();
const { colors } = useTheme();
const styles = createStyles(colors);
const [loading, setLoading] = useState(false);
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [phone, setPhone] = useState('');
const [extra, setExtra] = useState('');

const role = profile?.user.role;

useEffect(() => {
if (!profile) return;


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

const getAvatar = () => {
if (!profile) return null;


if (role === 'OWNER') return profile.petOwner?.avatarUrl;
if (role === 'VET') return profile.veterinarian?.avatarUrl;
if (role === 'SERVICE') return profile.serviceProvider?.avatarUrl;

return null;


};

const getInitials = () => {
if (!profile) return 'U';


if (role === 'OWNER') {
  return profile.petOwner?.username?.[0] || 'O';
}

if (role === 'VET') {
  return (
    (profile.veterinarian?.firstName?.[0] || '') +
    (profile.veterinarian?.lastName?.[0] || '')
  ) || 'V';
}

if (role === 'SERVICE') {
  return (
    (profile.serviceProvider?.firstName?.[0] || '') +
    (profile.serviceProvider?.lastName?.[0] || '')
  ) || 'S';
}

return 'U';


};

const handlePickImage = async () => {
const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();


if (!permission.granted) {
  Alert.alert('Нет доступа к галерее');
  return;
}

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  quality: 0.7,
});

if (result.canceled) return;

const image = result.assets[0];

try {
  const token = await AsyncStorage.getItem('token');

  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  } as any);

  let url = '';

  if (role === 'OWNER') {
    url = '/pet-management/api/pet-owners/me/avatar';
  }

  if (role === 'VET') {
    url = '/specialist-service/api/veterinarians/me/avatar';
  }

  if (role === 'SERVICE') {
    url = '/specialist-service/api/service-providers/me/avatar';
  }

  if (!url) return;

  await api.post(url, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  await fetchProfile();
} catch (e: any) {
  console.log(e?.response?.data);
  Alert.alert('Ошибка загрузки аватара');
}


};

const handleSave = async () => {
try {
setLoading(true);


  const token = await AsyncStorage.getItem('token');

  if (!token || !role) return;

  if (role === 'OWNER') {
    await api.put(
      '/pet-management/api/pet-owners/me',
      { username: extra, phoneNumber: phone },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  if (role === 'VET') {
    await api.put(
      '/specialist-service/api/veterinarians/me',
      { firstName, lastName, phoneNumber: phone },
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
  Alert.alert('Ошибка обновления');
} finally {
  setLoading(false);
}


};

return ( <SafeAreaView style={styles.container}> <ScrollView>

    {/* HEADER */}
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backIcon}>←</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.headerTitle}>
        Edit Profile
      </ThemedText>

      <View style={{ width: 40 }} />
    </View>

    {/* AVATAR */}
    <View style={styles.avatarContainer}>
      <TouchableOpacity onPress={handlePickImage}>

        {getAvatar() ? (
          <Image
            source={{ uri: getAvatar() + '?t=' + Date.now() }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <ThemedText style={styles.initials}>
              {getInitials()}
            </ThemedText>
          </View>
        )}

        <View style={styles.editBadge}>
          <ThemedText style={{ color: '#fff', fontSize: 12 }}>
            Edit
          </ThemedText>
        </View>

      </TouchableOpacity>
    </View>

    {/* FORM */}
    <View style={styles.form}>

      {(role === 'VET' || role === 'SERVICE') && (
        <>
          <TextInput
            placeholder="First Name"
            placeholderTextColor={colors.text.tertiary}
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor={colors.text.tertiary}
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
        </>
      )}

      {role === 'OWNER' && (
        <TextInput
          placeholder="Username"
          placeholderTextColor={colors.text.tertiary}
          value={extra}
          onChangeText={setExtra}
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Phone"
        placeholderTextColor={colors.text.tertiary}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      {role === 'SERVICE' && (
        <TextInput
          placeholder="Service Category"
          placeholderTextColor={colors.text.tertiary}
          value={extra}
          onChangeText={setExtra}
          style={styles.input}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        {loading ? (
          <ActivityIndicator color={colors.text.inverse} />
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background.primary,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },

    backButton: {
      width: 45,
      height: 45,
      borderRadius: 12,
      backgroundColor: colors.card.default,
      alignItems: 'center',
      justifyContent: 'center',

      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },

    backIcon: {
      fontSize: 24,
      color: colors.primary.main,
    },

    avatarContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },

    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
    },

    avatarFallback: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
    },

    initials: {
      color: colors.text.inverse,
      fontSize: 28,
      fontWeight: '700',
    },

    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary.main,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },

    form: {
      gap: 12,
    },

    input: {
      backgroundColor: colors.input.background,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.input.border,
      color: colors.text.primary,
    },

    button: {
      backgroundColor: colors.primary.main,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 10,
    },

    buttonText: {
      color: colors.text.inverse,
      fontWeight: '600',
    },
  });