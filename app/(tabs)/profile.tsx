import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/profileStore';
import { Role } from '@/types/profile';
import { profileStyles } from '@/styles/profileScreenStyles';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading, error, fetchProfile, logout } = useProfileStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
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
    router.push("/my_pets");
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
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>Personal Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={profileStyles.infoCard}>
            <View style={profileStyles.infoIcon}>
              <Feather name={item.icon as any} size={20} color="#FF6B6B" />
            </View>
            <View style={profileStyles.infoContent}>
              <Text style={profileStyles.infoLabel}>{item.label}</Text>
              <Text style={profileStyles.infoValue}>{item.value}</Text>
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
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>Professional Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={profileStyles.infoCard}>
            <View style={profileStyles.infoIcon}>
              <Feather name={item.icon as any} size={20} color="#4ECDC4" />
            </View>
            <View style={profileStyles.infoContent}>
              <Text style={profileStyles.infoLabel}>{item.label}</Text>
              <Text style={profileStyles.infoValue}>{item.value}</Text>
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
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>Service Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={profileStyles.infoCard}>
            <View style={profileStyles.infoIcon}>
              <Feather name={item.icon as any} size={20} color="#FFE66D" />
            </View>
            <View style={profileStyles.infoContent}>
              <Text style={profileStyles.infoLabel}>{item.label}</Text>
              <Text style={profileStyles.infoValue}>{item.value}</Text>
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
      <View style={profileStyles.infoSection}>
        <Text style={profileStyles.sectionTitle}>Admin Information</Text>
        {infoItems.map((item, index) => (
          <View key={index} style={profileStyles.infoCard}>
            <View style={profileStyles.infoIcon}>
              <Feather name={item.icon as any} size={20} color="#A8E6CF" />
            </View>
            <View style={profileStyles.infoContent}>
              <Text style={profileStyles.infoLabel}>{item.label}</Text>
              <Text style={profileStyles.infoValue}>{item.value}</Text>
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
          <View style={profileStyles.actionsSection}>
            <Text style={profileStyles.sectionTitle}>My Pets</Text>
            <TouchableOpacity style={profileStyles.actionCard} onPress={handleMyPets}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E8E"]}
                style={profileStyles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={profileStyles.actionLeft}>
                  <MaterialCommunityIcons name="paw" size={24} color="#FFF" />
                  <View style={profileStyles.actionTextContainer}>
                    <Text style={profileStyles.actionTitle}>My Pets</Text>
                    <Text style={profileStyles.actionSubtitle}>Manage your furry friends</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={profileStyles.actionCard} onPress={handleMyAppointments}>
              <LinearGradient
                colors={["#4ECDC4", "#6BE4DC"]}
                style={profileStyles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={profileStyles.actionLeft}>
                  <Feather name="calendar" size={24} color="#FFF" />
                  <View style={profileStyles.actionTextContainer}>
                    <Text style={profileStyles.actionTitle}>Appointments</Text>
                    <Text style={profileStyles.actionSubtitle}>View your booking history</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      
      case Role.VET:
      case Role.SERVICE:
        return (
          <View style={profileStyles.actionsSection}>
            <Text style={profileStyles.sectionTitle}>Work</Text>
            <TouchableOpacity style={profileStyles.actionCard} onPress={handleMyAppointments}>
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                style={profileStyles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={profileStyles.actionLeft}>
                  <Feather name="briefcase" size={24} color="#FFF" />
                  <View style={profileStyles.actionTextContainer}>
                    <Text style={profileStyles.actionTitle}>My Schedule</Text>
                    <Text style={profileStyles.actionSubtitle}>Manage client appointments</Text>
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
      <View style={profileStyles.centerContainer}>
        <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={profileStyles.loadingGradient}>
          <MaterialCommunityIcons name="paw" size={48} color="#FFF" />
          <Text style={profileStyles.loadingText}>Loading profile...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={profileStyles.centerContainer}>
        <View style={profileStyles.errorContainer}>
          <Feather name="alert-circle" size={64} color="#FF6B6B" />
          <Text style={profileStyles.errorText}>{error}</Text>
          <TouchableOpacity style={profileStyles.retryButton} onPress={fetchProfile}>
            <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={profileStyles.retryGradient}>
              <Feather name="refresh-cw" size={20} color="#FFF" />
              <Text style={profileStyles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const stats = getStats();

  return (
    <ScrollView 
      style={profileStyles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />
      }
    >
      {/* Header with Cover Photo */}
      <View style={profileStyles.headerContainer}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E8E", "#FFB88C"]}
          style={profileStyles.coverPhoto}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={profileStyles.avatarWrapper}>
          <View style={profileStyles.avatarContainer}>
            <Image
              source={{ uri: getAvatarUrl() }}
              style={profileStyles.avatar}
            />
            <View style={profileStyles.statusBadge}>
              <View style={profileStyles.statusDot} />
            </View>
          </View>
          <View style={profileStyles.roleBadge}>
            <MaterialCommunityIcons name={getRoleIcon() as any} size={16} color="#FFF" />
          </View>
        </View>

        <Text style={profileStyles.userName}>{getDisplayName()}</Text>
        <Text style={profileStyles.userRole}>{getRoleName()}</Text>
        <Text style={profileStyles.userEmail}>{profile?.user.email}</Text>
      </View>

      {/* Stats Cards */}
      <View style={profileStyles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={profileStyles.statCard}>
            <LinearGradient
              colors={["#FFFFFF", "#F8F9FA"]}
              style={profileStyles.statGradient}
            >
              <View style={profileStyles.statIcon}>
                <Feather name={stat.icon as any} size={24} color="#FF6B6B" />
              </View>
              <Text style={profileStyles.statNumber}>{stat.value}</Text>
              <Text style={profileStyles.statLabel}>{stat.label}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Role Specific Information */}
      {profile?.user.role === Role.OWNER && renderOwnerInfo()}
      {profile?.user.role === Role.VET && renderVetInfo()}
      {profile?.user.role === Role.SERVICE && renderServiceInfo()}
      {profile?.user.role === Role.ADMIN && renderAdminInfo()}

      {/* Role Specific Actions */}
      {renderRoleSpecificActions()}

      {/* Settings Section */}
      <View style={profileStyles.actionsSection}>
        <Text style={profileStyles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={profileStyles.settingItem} onPress={handleEditProfile}>
          <View style={profileStyles.settingLeft}>
            <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={profileStyles.settingIcon}>
              <Feather name="edit-2" size={18} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={profileStyles.settingTitle}>Edit Profile</Text>
              <Text style={profileStyles.settingSubtitle}>Update your personal information</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.settingItem} onPress={handleSettings}>
          <View style={profileStyles.settingLeft}>
            <LinearGradient colors={["#4ECDC4", "#6BE4DC"]} style={profileStyles.settingIcon}>
              <Feather name="settings" size={18} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={profileStyles.settingTitle}>Settings</Text>
              <Text style={profileStyles.settingSubtitle}>Notifications, language & more</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={[profileStyles.settingItem, profileStyles.logoutItem]} onPress={handleLogout}>
          <View style={profileStyles.settingLeft}>
            <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={profileStyles.settingIcon}>
              <Feather name="log-out" size={18} color="#FFF" />
            </LinearGradient>
            <View>
              <Text style={[profileStyles.settingTitle, profileStyles.logoutText]}>Logout</Text>
              <Text style={profileStyles.settingSubtitle}>Sign out from your account</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      <View style={profileStyles.bottomSpacing} />
    </ScrollView>
  );
}