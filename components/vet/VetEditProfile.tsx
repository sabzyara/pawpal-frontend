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
import '@/app/i18n';
import { useTranslation } from 'react-i18next';

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
  const { colors, typography, spacing } = useTheme();
  const {t} = useTranslation();
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
      Alert.alert(
        t("editProfile.success"),
        t("editProfile.profileUpdated")
      );
      onUpdate();
    } catch (error) {
      Alert.alert(
        t("editProfile.error"),
        t("editProfile.updateFailed")
      );
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
        
        Alert.alert(
          t("editProfile.success"),
          t("editProfile.avatarUpdated")
        );
        onUpdate();
      } catch (error) {
        Alert.alert(
          t("editProfile.error"),
          t("editProfile.avatarFailed")
        );
      }
    }
  };

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      style={{ marginTop: spacing.md }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >

      <TouchableOpacity 
        onPress={uploadAvatar} 
        activeOpacity={0.8}
        style={{ 
          alignItems: 'center', 
          marginBottom: spacing.lg 
        }}
      >
        <View
          style={{
            position: 'relative',
          }}
        >
          <Image
            source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/100' }}
            style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 50, 
              marginBottom: spacing.sm,
              borderWidth: 3,
              borderColor: colors.primary.light,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              right: 0,
              backgroundColor: colors.primary.main,
              borderRadius: 20,
              padding: 6,
            }}
          >
            <Ionicons name="camera" size={16} color={colors.text.inverse} />
          </View>
        </View>
        <Text style={{ color: colors.primary.main, fontWeight: '500' }}>
          {t("editProfile.changePhoto")}
        </Text>
      </TouchableOpacity>


      <View style={{ gap: spacing.md }}>
        

        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="person-outline" size={22} color={colors.primary.main} />
            <Text
              style={[
                typography.body1SemiBold,
                { color: colors.text.primary },
              ]}
            >
             {t("editProfile.basicInfo")}
            </Text>
          </View>

          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
                  {t("editProfile.firstName")}
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
                  {t("editProfile.lastName")}
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
                {t("editProfile.phone")}
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
               {t("editProfile.city")}
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

            <View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
                {t("editProfile.address")}
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
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="school-outline" size={22} color={colors.primary.main} />
            <Text
              style={[
                typography.body1SemiBold,
                { color: colors.text.primary },
              ]}
            >
              {t("editProfile.professionalInfo")}
            </Text>
          </View>

          <View style={{ gap: spacing.md }}>
            <View>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
                {t("editProfile.experience")}
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
                {t("editProfile.education")}
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

            {type === 'vet' && (
              <>
                <View>
                  <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
                    {t("editProfile.clinic")}
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
                    {t("editProfile.license")}
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
                  {t("editProfile.serviceCategory")}
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
          </View>
        </View>


        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="document-text-outline" size={22} color={colors.primary.main} />
            <Text
              style={[
                typography.body1SemiBold,
                { color: colors.text.primary },
              ]}
            >
              {t("editProfile.about")}
            </Text>
          </View>

          <TextInput
            value={formData.about}
            onChangeText={(text) => setFormData({ ...formData, about: text })}
            multiline
            numberOfLines={4}
            placeholder={t("editProfile.aboutPlaceholder")}
            placeholderTextColor={colors.text.tertiary}
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


        <View
          style={{
            backgroundColor: colors.card.default,
            borderRadius: 24,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border.light,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              marginBottom: spacing.md,
            }}
          >
            <Ionicons name="cash-outline" size={22} color={colors.primary.main} />
            <Text
              style={[
                typography.body1SemiBold,
                { color: colors.text.primary },
              ]}
            >
              {t("editProfile.serviceCost")}
            </Text>
          </View>

          <View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 4 }]}>
              {t("editProfile.visitPrice")}
            </Text>
            <TextInput
              value={formData.pricePerVisit}
              onChangeText={(text) => setFormData({ ...formData, pricePerVisit: text })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text.tertiary}
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


        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.primary.main,
            padding: 16,
            borderRadius: 16,
            alignItems: 'center',
            marginTop: spacing.sm,
            marginBottom: spacing.xl,
            opacity: loading ? 0.7 : 1,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color={colors.text.inverse} />
              <Text style={[typography.button, { color: colors.text.inverse, fontWeight: '600' }]}>
                {t("editProfile.saveChanges")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};