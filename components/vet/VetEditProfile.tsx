import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '@/services/api';

interface VetEditProfileProps {
  profile: any;
  type: 'vet' | 'service';
  onUpdate: () => void;
}

export const VetEditProfile: React.FC<VetEditProfileProps> = ({
  profile,
  type,
  onUpdate,
}) => {
  const { colors, typography } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phoneNumber: profile.phoneNumber || '',
    about: profile.about || '',
    address: profile.address || '',
    clinicName: profile.clinicName || '',
    education: profile.education || '',
    pricePerVisit: profile.pricePerVisit?.toString() || '',
    city: profile.city || '',
    licenseNumber: profile.licenseNumber || '',
    serviceCategory: profile.specialty || '',
    experienceYears: profile.experienceYears?.toString() || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'service'
        ? '/specialist-service/service-providers/me'
        : '/specialist-service/veterinarians/me';
      
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        about: formData.about,
        address: formData.address,
        city: formData.city,
        education: formData.education,
        experienceYears: parseInt(formData.experienceYears) || 0,
      };
      
      if (type === 'vet') {
        updateData.clinicName = formData.clinicName;
        updateData.licenseNumber = formData.licenseNumber;
        updateData.pricePerVisit = parseFloat(formData.pricePerVisit) || 0;
      } else {
        updateData.serviceCategory = formData.serviceCategory;
        updateData.pricePerVisit = parseFloat(formData.pricePerVisit) || 0;
      }
      
      await api.put(endpoint, updateData);
      Alert.alert('Успех', 'Профиль успешно обновлен');
      onUpdate();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);

        const endpoint = type === 'service'
          ? '/specialist-service/service-providers/me/avatar'
          : '/specialist-service/veterinarians/me/avatar';

        const response = await api.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        Alert.alert('Успех', 'Аватар обновлен');
        onUpdate();
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить аватар');
      }
    }
  };

  return (
    <ScrollView style={{ marginTop: 16 }}>
      {/* Аватар */}
      <TouchableOpacity onPress={uploadAvatar} style={{ alignItems: 'center', marginBottom: 24 }}>
        <Image
          source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/100' }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 8 }}
        />
        <Text style={{ color: colors.primary.main }}>Изменить фото</Text>
      </TouchableOpacity>

      {/* Форма */}
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
              Имя *
            </Text>
            <TextInput
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
              Фамилия *
            </Text>
            <TextInput
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
          </View>
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            Телефон
          </Text>
          <TextInput
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
            keyboardType="phone-pad"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            О себе
          </Text>
          <TextInput
            value={formData.about}
            onChangeText={(text) => setFormData({ ...formData, about: text })}
            multiline
            numberOfLines={4}
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              minHeight: 100,
              textAlignVertical: 'top',
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            Образование
          </Text>
          <TextInput
            value={formData.education}
            onChangeText={(text) => setFormData({ ...formData, education: text })}
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            Опыт (лет)
          </Text>
          <TextInput
            value={formData.experienceYears}
            onChangeText={(text) => setFormData({ ...formData, experienceYears: text })}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            Адрес
          </Text>
          <TextInput
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            Город
          </Text>
          <TextInput
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        {type === 'vet' && (
          <>
            <View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
                Клиника
              </Text>
              <TextInput
                value={formData.clinicName}
                onChangeText={(text) => setFormData({ ...formData, clinicName: text })}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                }}
              />
            </View>
            <View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
                Лицензия
              </Text>
              <TextInput
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData({ ...formData, licenseNumber: text })}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                }}
              />
            </View>
          </>
        )}

        {type === 'service' && (
          <View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
              Категория услуг
            </Text>
            <TextInput
              value={formData.serviceCategory}
              onChangeText={(text) => setFormData({ ...formData, serviceCategory: text })}
              style={{
                borderWidth: 1,
                borderColor: colors.border.light,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.background.primary,
                color: colors.text.primary,
              }}
            />
          </View>
        )}

        <View>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
            Цена за визит ($)
          </Text>
          <TextInput
            value={formData.pricePerVisit}
            onChangeText={(text) => setFormData({ ...formData, pricePerVisit: text })}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              borderRadius: 12,
              padding: 12,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            backgroundColor: colors.primary.main,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 16,
            marginBottom: 32,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>
              Сохранить изменения
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};