import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import { Role } from '@/types/profile';
import { profileStyles } from '@/styles/profileScreenStyles';

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
      "Выход из аккаунта",
      "Вы уверены, что хотите выйти?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Выйти", 
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

  const renderOwnerProfile = () => {
    const owner = profile?.petOwner;
    return (
      <View style={profileStyles.infoSection}>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>👤 Имя пользователя</Text>
          <Text style={profileStyles.infoValue}>{owner?.username || "Не указано"}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>📞 Телефон</Text>
          <Text style={profileStyles.infoValue}>{owner?.phoneNumber || "Не указан"}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>📍 Адрес</Text>
          <Text style={profileStyles.infoValue}>{owner?.address || "Не указан"}</Text>
        </View>
      </View>
    );
  };

  const renderVetProfile = () => {
    const vet = profile?.veterinarian;
    return (
      <View style={profileStyles.infoSection}>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>👨‍⚕️ Имя</Text>
          <Text style={profileStyles.infoValue}>{vet?.firstName} {vet?.lastName}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>📞 Телефон</Text>
          <Text style={profileStyles.infoValue}>{vet?.phoneNumber || "Не указан"}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>🔬 Лицензия</Text>
          <Text style={profileStyles.infoValue}>{vet?.licenseNumber || "Не указана"}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>🏥 Клиника</Text>
          <Text style={profileStyles.infoValue}>{vet?.clinicName || "Не указана"}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>📅 Опыт работы</Text>
          <Text style={profileStyles.infoValue}>{vet?.experienceYears || 0} лет</Text>
        </View>
      </View>
    );
  };

  const renderServiceProfile = () => {
    const service = profile?.serviceProvider;
    return (
      <View style={profileStyles.infoSection}>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>👤 Имя</Text>
          <Text style={profileStyles.infoValue}>{service?.firstName} {service?.lastName}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>📞 Телефон</Text>
          <Text style={profileStyles.infoValue}>{service?.phoneNumber || "Не указан"}</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>🛠️ Услуга</Text>
          <Text style={profileStyles.infoValue}>{service?.serviceCategory || "Не указана"}</Text>
        </View>
      </View>
    );
  };

  const renderAdminProfile = () => {
    return (
      <View style={profileStyles.infoSection}>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>👑 Роль</Text>
          <Text style={profileStyles.infoValue}>Администратор</Text>
        </View>
        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.infoLabel}>📧 Email</Text>
          <Text style={profileStyles.infoValue}>{profile?.user.email}</Text>
        </View>
      </View>
    );
  };

  const renderProfileContent = () => {
    if (!profile) return null;

    switch (profile.user.role) {
      case Role.OWNER:
        return renderOwnerProfile();
      case Role.VET:
        return renderVetProfile();
      case Role.SERVICE:
        return renderServiceProfile();
      case Role.ADMIN:
        return renderAdminProfile();
      default:
        return null;
    }
  };

  const getRoleIcon = () => {
    switch (profile?.user.role) {
      case Role.OWNER:
        return "🐾";
      case Role.VET:
        return "👨‍⚕️";
      case Role.SERVICE:
        return "🛠️";
      case Role.ADMIN:
        return "👑";
      default:
        return "👤";
    }
  };

  const getRoleName = () => {
    switch (profile?.user.role) {
      case Role.OWNER:
        return "Владелец питомца";
      case Role.VET:
        return "Ветеринар";
      case Role.SERVICE:
        return "Сервис-провайдер";
      case Role.ADMIN:
        return "Администратор";
      default:
        return "Пользователь";
    }
  };

  if (loading && !profile) {
    return (
      <View style={profileStyles.centerContainer}>
        <Text style={profileStyles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={profileStyles.centerContainer}>
        <Text style={profileStyles.errorText}>{error}</Text>
        <TouchableOpacity style={profileStyles.retryButton} onPress={fetchProfile}>
          <Text style={profileStyles.retryButtonText}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={profileStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header с аватаром */}
      <View style={profileStyles.header}>
        <View style={profileStyles.avatarContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150" }}
            style={profileStyles.avatar}
          />
          <View style={profileStyles.roleBadge}>
            <Text style={profileStyles.roleIcon}>{getRoleIcon()}</Text>
          </View>
        </View>
        <Text style={profileStyles.userName}>
          {profile?.petOwner?.username || 
           profile?.veterinarian?.firstName + " " + profile?.veterinarian?.lastName ||
           profile?.serviceProvider?.firstName + " " + profile?.serviceProvider?.lastName ||
           profile?.user.email}
        </Text>
        <Text style={profileStyles.userRole}>{getRoleName()}</Text>
        <Text style={profileStyles.userEmail}>{profile?.user.email}</Text>
      </View>

      {/* Статистика */}
      <View style={profileStyles.statsContainer}>
        <View style={profileStyles.statItem}>
          <Text style={profileStyles.statNumber}>12</Text>
          <Text style={profileStyles.statLabel}>Питомцев</Text>
        </View>
        <View style={profileStyles.statDivider} />
        <View style={profileStyles.statItem}>
          <Text style={profileStyles.statNumber}>24</Text>
          <Text style={profileStyles.statLabel}>Записей</Text>
        </View>
        <View style={profileStyles.statDivider} />
        <View style={profileStyles.statItem}>
          <Text style={profileStyles.statNumber}>4.8</Text>
          <Text style={profileStyles.statLabel}>Рейтинг</Text>
        </View>
      </View>

      {/* Информация о пользователе */}
      {renderProfileContent()}

      {/* Кнопки для владельца питомца */}
      {profile?.user.role === Role.OWNER && (
        <View style={profileStyles.actionsSection}>
          <Text style={profileStyles.sectionTitle}>Мои питомцы</Text>
          
          <TouchableOpacity style={profileStyles.actionCard} onPress={handleMyPets}>
            <View style={profileStyles.actionIcon}>
              <Text style={profileStyles.actionIconText}>🐕</Text>
            </View>
            <View style={profileStyles.actionContent}>
              <Text style={profileStyles.actionTitle}>Мои питомцы</Text>
              <Text style={profileStyles.actionSubtitle}>
                Просмотр и управление питомцами
              </Text>
            </View>
            <Text style={profileStyles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={profileStyles.actionCard} onPress={handleMyAppointments}>
            <View style={profileStyles.actionIcon}>
              <Text style={profileStyles.actionIconText}>📅</Text>
            </View>
            <View style={profileStyles.actionContent}>
              <Text style={profileStyles.actionTitle}>Записи</Text>
              <Text style={profileStyles.actionSubtitle}>
                История записей к специалистам
              </Text>
            </View>
            <Text style={profileStyles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Кнопки для специалистов */}
      {(profile?.user.role === Role.VET || profile?.user.role === Role.SERVICE) && (
        <View style={profileStyles.actionsSection}>
          <Text style={profileStyles.sectionTitle}>Работа</Text>
          
          <TouchableOpacity style={profileStyles.actionCard} onPress={handleMyAppointments}>
            <View style={profileStyles.actionIcon}>
              <Text style={profileStyles.actionIconText}>📋</Text>
            </View>
            <View style={profileStyles.actionContent}>
              <Text style={profileStyles.actionTitle}>Мои записи</Text>
              <Text style={profileStyles.actionSubtitle}>
                Расписание и записи клиентов
              </Text>
            </View>
            <Text style={profileStyles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Общие настройки */}
      <View style={profileStyles.actionsSection}>
        <Text style={profileStyles.sectionTitle}>Настройки</Text>
        
        <TouchableOpacity style={profileStyles.actionCard} onPress={handleEditProfile}>
          <View style={profileStyles.actionIcon}>
            <Text style={profileStyles.actionIconText}>✏️</Text>
          </View>
          <View style={profileStyles.actionContent}>
            <Text style={profileStyles.actionTitle}>Редактировать профиль</Text>
            <Text style={profileStyles.actionSubtitle}>
              Изменить личную информацию
            </Text>
          </View>
          <Text style={profileStyles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={profileStyles.actionCard} onPress={handleSettings}>
          <View style={profileStyles.actionIcon}>
            <Text style={profileStyles.actionIconText}>⚙️</Text>
          </View>
          <View style={profileStyles.actionContent}>
            <Text style={profileStyles.actionTitle}>Настройки</Text>
            <Text style={profileStyles.actionSubtitle}>
              Уведомления, язык и другое
            </Text>
          </View>
          <Text style={profileStyles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[profileStyles.actionCard, profileStyles.logoutCard]} onPress={handleLogout}>
          <View style={profileStyles.actionIcon}>
            <Text style={profileStyles.actionIconText}>🚪</Text>
          </View>
          <View style={profileStyles.actionContent}>
            <Text style={[profileStyles.actionTitle, profileStyles.logoutText]}>Выйти</Text>
            <Text style={profileStyles.actionSubtitle}>
              Выйти из аккаунта
            </Text>
          </View>
          <Text style={profileStyles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={profileStyles.bottomSpacing} />
    </ScrollView>
  );
}