import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
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
import * as ImagePicker from 'expo-image-picker';
import { Role } from '@/types/profile';

export default function EditProfileScreen() {
  const { profile, fetchProfile } = useProfileStore();
  const user = useAuthStore((state) => state.user);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const role = profile?.user?.role || user?.role;

  // Проверка доступа - только OWNER и ADMIN
  const hasAccess = role === Role.OWNER || role === Role.ADMIN;

  useEffect(() => {
    if (!profile) return;

    // Для OWNER
    if (role === Role.OWNER && profile.petOwner) {
      setUsername(profile.petOwner.username || '');
      setPhone(profile.petOwner.phoneNumber || '');
      setAddress(profile.petOwner.address || '');
    }

    // Для ADMIN - нет профиля, только email
    if (role === Role.ADMIN) {
      setUsername('');
      setPhone('');
      setAddress('');
    }
  }, [profile, role]);

  const getAvatar = () => {
    if (!profile) return null;

    if (role === Role.OWNER) return profile.petOwner?.avatarUrl;
    if (role === Role.ADMIN) return null;

    return null;
  };

  const getInitials = () => {
    if (!profile) return 'U';

    if (role === Role.OWNER) {
      return profile.petOwner?.username?.[0] || 'O';
    }

    if (role === Role.ADMIN) {
      return profile.user.email?.[0]?.toUpperCase() || 'A';
    }

    return 'U';
  };

  const handlePickImage = async () => {
    if (role !== Role.OWNER) {
      Alert.alert('Доступ запрещен', 'Только владельцы могут менять аватар');
      return;
    }

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
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      const url = '/pet-management/api/pet-owners/me/avatar';

      await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (user) {
        await fetchProfile(user);
      }
      
      Alert.alert('Успех', 'Аватар обновлен');
    } catch (e: any) {
      console.log(e?.response?.data);
      Alert.alert('Ошибка загрузки аватара');
    }
  };

  const handleSave = async () => {
    // ADMIN не может редактировать профиль
    if (role === Role.ADMIN) {
      Alert.alert('Информация', 'Администратор не может редактировать профиль');
      router.back();
      return;
    }

    try {
      setLoading(true);

      if (!user || !role) return;

      if (role === Role.OWNER) {
        await api.put(
          '/pet-management/api/pet-owners/me',
          { username, phoneNumber: phone, address }
        );
      }

      if (user) {
        await fetchProfile(user);
      }

      Alert.alert('Успех', 'Профиль обновлен');
      router.back();
    } catch (e: any) {
      console.log(e?.response?.data);
      Alert.alert('Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  // Если нет доступа - показываем сообщение
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Доступ запрещен</ThemedText>
          <ThemedText style={styles.errorSubtext}>
            Только для владельцев и администраторов
          </ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Назад</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backIcon}>←</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>
            {role === Role.ADMIN ? 'Admin Profile' : 'Edit Profile'}
          </ThemedText>

          <View style={{ width: 40 }} />
        </View>

        {/* AVATAR - только для OWNER */}
        {role === Role.OWNER && (
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
        )}

        {/* FORM */}
        <View style={styles.form}>
          {role === Role.OWNER && (
            <>
              <TextInput
                placeholder="Username"
                placeholderTextColor={colors.text.tertiary}
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />

              <TextInput
                placeholder="Phone"
                placeholderTextColor={colors.text.tertiary}
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <TextInput
                placeholder="Address"
                placeholderTextColor={colors.text.tertiary}
                value={address}
                onChangeText={setAddress}
                style={styles.input}
              />
            </>
          )}

          {role === Role.ADMIN && (
            <>
              <View style={styles.infoCard}>
                <ThemedText style={styles.infoLabel}>Email</ThemedText>
                <ThemedText style={styles.infoValue}>{profile?.user.email || user?.email}</ThemedText>
              </View>
              <View style={styles.infoCard}>
                <ThemedText style={styles.infoLabel}>Role</ThemedText>
                <ThemedText style={styles.infoValue}>Administrator</ThemedText>
              </View>
              <ThemedText style={styles.noteText}>
                Администраторы не могут редактировать свой профиль
              </ThemedText>
            </>
          )}

          {role === Role.OWNER && (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <ThemedText style={styles.buttonText}>
                  Save Changes
                </ThemedText>
              )}
            </TouchableOpacity>
          )}

          {role === Role.ADMIN && (
            <TouchableOpacity style={styles.backButtonFull} onPress={() => router.back()}>
              <ThemedText style={styles.backButtonText}>Назад</ThemedText>
            </TouchableOpacity>
          )}
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

    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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

    backButtonFull: {
      backgroundColor: colors.primary.main,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 10,
    },

    backButtonText: {
      color: colors.text.inverse,
      fontWeight: '600',
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

    infoCard: {
      backgroundColor: colors.card.default,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
    },

    infoLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },

    infoValue: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },

    noteText: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: 16,
    },

    errorText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.error?.main || '#FF3B30',
      marginBottom: 8,
    },

    errorSubtext: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 20,
      textAlign: 'center',
    },
  });