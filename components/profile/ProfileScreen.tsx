import { useTheme } from '@/hooks/useTheme';
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore'; // ✅ ДОБАВЛЕНО
import { profileStyles } from '@/styles/profileScreenStyles';
import { Role } from '@/types/profile';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { colors } = useTheme();
  const styles = profileStyles(colors);
  const router = useRouter();
  
  // ✅ ИСПРАВЛЕНО: убраны loading, error, logout из profileStore
  const { profile, fetchProfile } = useProfileStore();
  const user = useAuthStore((state) => state.user); // ✅ ДОБАВЛЕНО для authUser
  const logout = useAuthStore((state) => state.logout); // ✅ ДОБАВЛЕНО из authStore
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ ДОБАВЛЕНО локальное состояние
  const [error, setError] = useState<string | null>(null); // ✅ ДОБАВЛЕНО локальное состояние

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // ✅ ИСПРАВЛЕНО: передан user
        if (user) {
          await fetchProfile(user);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]); // ✅ ДОБАВЛЕНА зависимость от user

  useEffect(() => {
    if (!profile) return;

    const role = profile.user.role;

    if (role === Role.OWNER && !profile.petOwner) {
      router.replace('/complete_profile');
    }

    if (role === Role.VET && !profile.veterinarian) {
      router.replace('/complete_vet');
    }

    if (role === Role.SERVICE && !profile.serviceProvider) {
      router.replace('/complete_service');
    }

  }, [profile]);

  const onRefresh = async () => {
    setRefreshing(true);
    // ✅ ИСПРАВЛЕНО: передан user
    if (user) {
      await fetchProfile(user);
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push("/edit_profile");
  };

  const handleMyPets = () => {
    router.push("/my_pet"); 
  };

  const handleMyAppointments = () => {
    router.push("/my_appointments");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const getRoleIcon = (): string => {
    switch (profile?.user.role) {
      case Role.OWNER:
        return "paw";
      case Role.VET:
        return "stethoscope";
      case Role.SERVICE:
        return "tools";
      case Role.ADMIN:
        return "crown";
      default:
        return "user";
    }
  };

  const getRoleName = (): string => {
    switch (profile?.user.role) {
      case Role.OWNER:
        return "Pet Owner";
      case Role.VET:
        return "Veterinarian";
      case Role.SERVICE:
        return "Service Provider";
      case Role.ADMIN:
        return "Administrator";
      default:
        return "User";
    }
  };

  const getDisplayName = (): string => {
    if (profile?.petOwner?.username) return profile.petOwner.username;
    if (profile?.veterinarian?.firstName) {
      return `${profile.veterinarian.firstName} ${profile.veterinarian.lastName}`;
    }
    if (profile?.serviceProvider?.firstName) {
      return `${profile.serviceProvider.firstName} ${profile.serviceProvider.lastName}`;
    }
    return profile?.user.email?.split('@')[0] || "User";
  };

    
  const getAvatarUrl = (): string => {
    const role = profile?.user.role;

    if (role === Role.OWNER && profile?.petOwner?.avatarUrl) {
      return profile.petOwner.avatarUrl;
    }

    if (role === Role.VET && profile?.veterinarian?.avatarUrl) {
      return profile.veterinarian.avatarUrl;
    }

    if (role === Role.SERVICE && profile?.serviceProvider?.avatarUrl) {
      return profile.serviceProvider.avatarUrl;
    }

    // fallback
    const seed = getDisplayName() || "user";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=FF6B6B&color=fff&size=150`;
  };

  const getStats = () => {
    switch (profile?.user.role) {
      case Role.OWNER:
        return [
          { value: "12", label: "Pets", icon: "paw" },
          { value: "24", label: "Appointments", icon: "calendar" },
          { value: "4.8", label: "Rating", icon: "star" },
        ];
      case Role.VET:
        return [
          { value: "156", label: "Patients", icon: "users" },
          { value: "8", label: "Years", icon: "clock" },
          { value: "4.9", label: "Rating", icon: "star" },
        ];
      case Role.SERVICE:
        return [
          { value: "45", label: "Services", icon: "briefcase" },
          { value: "98%", label: "Satisfaction", icon: "thumbs-up" },
          { value: "4.7", label: "Rating", icon: "star" },
        ];
      default:
        return [
          { value: "1", label: "Role", icon: "shield" },
          { value: "100%", label: "Access", icon: "check-circle" },
          { value: "5.0", label: "Rating", icon: "star" },
        ];
    }
  };

  const renderOwnerInfo = () => {
    const owner = profile?.petOwner;
    const infoItems = [
      { icon: "user", label: "Username", value: owner?.username || "Not specified" },
      { icon: "phone", label: "Phone", value: owner?.phoneNumber || "Not specified" },
      { icon: "map-pin", label: "Address", value: owner?.address || "Not specified" },
    ];

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name={item.icon as any} size={20} color={colors.text.tertiary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderVetInfo = () => {
    const vet = profile?.veterinarian;
    const infoItems = [
      { icon: "user", label: "Full Name", value: `${vet?.firstName || ''} ${vet?.lastName || ''}`.trim() || "Not specified" },
      { icon: "phone", label: "Phone", value: vet?.phoneNumber || "Not specified" },
      { icon: "award", label: "License Number", value: vet?.licenseNumber || "Not specified" },
      { icon: "home", label: "Clinic", value: vet?.clinicName || "Not specified" },
      { icon: "clock", label: "Experience", value: `${vet?.experienceYears || 0} years` },
    ];

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Professional Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name={item.icon as any} size={20} color={colors.text.tertiary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderServiceInfo = () => {
    const service = profile?.serviceProvider;
    const infoItems = [
      { icon: "user", label: "Full Name", value: `${service?.firstName || ''} ${service?.lastName || ''}`.trim() || "Not specified" },
      { icon: "phone", label: "Phone", value: service?.phoneNumber || "Not specified" },
      { icon: "briefcase", label: "Service Category", value: service?.serviceCategory || "Not specified" },
    ];

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Service Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name={item.icon as any} size={20} color={colors.text.tertiary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAdminInfo = () => {
    const infoItems = [
      { icon: "shield", label: "Role", value: "Administrator" },
      { icon: "mail", label: "Email", value: profile?.user.email || "Not specified" },
    ];

    return (
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Admin Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Feather name={item.icon as any} size={20} color={colors.text.tertiary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRoleSpecificActions = () => {
    switch (profile?.user.role) {
      case Role.OWNER:
        return (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>My Pets</Text>
            <TouchableOpacity style={styles.actionCard} onPress={handleMyPets}>
              <LinearGradient
                colors={colors.primary.gradient}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.actionLeft}>
                  <MaterialCommunityIcons name="paw" size={24} color="#FFF" />
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>My Pets</Text>
                    <Text style={styles.actionSubtitle}>Manage your furry friends</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleMyAppointments}>
              <LinearGradient
                colors={colors.primary.gradient}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.actionLeft}>
                  <Feather name="calendar" size={24} color="#FFF" />
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>Appointments</Text>
                    <Text style={styles.actionSubtitle}>View your booking history</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      
      case Role.VET:
      case Role.SERVICE:
        return (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Work</Text>
            <TouchableOpacity style={styles.actionCard} onPress={handleMyAppointments}>
              <LinearGradient
                colors={colors.primary.gradient}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.actionLeft}>
                  <Feather name="briefcase" size={24} color="#FFF" />
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>My Schedule</Text>
                    <Text style={styles.actionSubtitle}>Manage client appointments</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <LinearGradient colors={colors.primary.gradient} style={styles.loadingGradient}>
          <MaterialCommunityIcons name="paw" size={48} color="#FFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            // ✅ ИСПРАВЛЕНО: обернуто в стрелочную функцию
            onPress={() => {
              if (user) {
                fetchProfile(user);
              }
            }}
          >
            <LinearGradient colors={colors.primary.gradient} style={styles.retryGradient}>
              <Feather name="refresh-cw" size={20} color="#FFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const stats = getStats();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            margin: 16,
            borderRadius: 16,
            backgroundColor: colors.card.default,
            borderWidth: 1,
            borderColor: colors.border.medium,
          }}
        >
          {/* АВАТАР */}
          <Image
            source={{ uri: getAvatarUrl() }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              marginRight: 16,
            }}
          />

          {/* ИНФА СПРАВА */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              {getDisplayName()}
            </Text>

            <Text style={{ color: colors.text.secondary }}>
              {getRoleName()}
            </Text>

            <Text style={{ color: colors.text.tertiary }}>
              {profile?.user.email}
            </Text>
          </View>
        </View>


        {/* Role Specific Information */}
        {profile?.user.role === Role.OWNER && renderOwnerInfo()}
        {profile?.user.role === Role.VET && renderVetInfo()}
        {profile?.user.role === Role.SERVICE && renderServiceInfo()}
        {profile?.user.role === Role.ADMIN && renderAdminInfo()}

        {/* Role Specific Actions */}
        {renderRoleSpecificActions()}

        {/* Settings Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
            <View style={styles.settingLeft}>
              <LinearGradient colors={colors.primary.gradient} style={styles.settingIcon}>
                <Feather name="edit-2" size={18} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={styles.settingTitle}>Edit Profile</Text>
                <Text style={styles.settingSubtitle}>Update your personal information</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSettings}>
            <View style={styles.settingLeft}>
              <LinearGradient colors={colors.primary.gradient} style={styles.settingIcon}>
                <Feather name="settings" size={18} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={styles.settingTitle}>Settings</Text>
                <Text style={styles.settingSubtitle}>Notifications, language & more</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <LinearGradient colors={colors.primary.gradient} style={styles.settingIcon}>
                <Feather name="log-out" size={18} color="#FFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
                <Text style={styles.settingSubtitle}>Sign out from your account</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}