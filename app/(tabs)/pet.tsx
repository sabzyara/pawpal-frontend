import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { petProfileStyles } from "@/styles/petScreenStyle";

const { width, height } = Dimensions.get("window");

interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: "male" | "female";
  age: number;
  weight: number;
  healthStatus: string;
  avatar: string;
  createdAt: string;
  lastCheckup: string;
  vaccinations: Vaccination[];
  appointments: Appointment[];
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDue: string;
  completed: boolean;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "vet" | "grooming" | "walk";
  status: "upcoming" | "completed" | "cancelled";
}

export default function PetProfileScreen() {
  const { id } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"info" | "health" | "appointments">("info");
  
  // Mock pet data - replace with actual API call
  const [petData, setPetData] = useState<PetData>({
    id: "1",
    name: "Max",
    species: "Dog",
    breed: "Golden Retriever",
    gender: "male",
    age: 3,
    weight: 28.5,
    healthStatus: "Healthy, active",
    avatar: "https://images.unsplash.com/photo-1552053831-7158f46f0c79",
    createdAt: "2023-01-15",
    lastCheckup: "2024-01-20",
    vaccinations: [
      {
        id: "1",
        name: "Rabies",
        date: "2024-01-15",
        nextDue: "2025-01-15",
        completed: true,
      },
      {
        id: "2",
        name: "Distemper",
        date: "2024-01-15",
        nextDue: "2025-01-15",
        completed: true,
      },
      {
        id: "3",
        name: "Bordetella",
        date: "2024-03-10",
        nextDue: "2024-09-10",
        completed: false,
      },
    ],
    appointments: [
      {
        id: "1",
        title: "Annual Checkup",
        date: "2024-03-25",
        time: "10:00 AM",
        type: "vet",
        status: "upcoming",
      },
      {
        id: "2",
        title: "Grooming Session",
        date: "2024-03-20",
        time: "2:00 PM",
        type: "grooming",
        status: "completed",
      },
    ],
  });

  const [editForm, setEditForm] = useState({
    name: petData.name,
    breed: petData.breed,
    age: petData.age.toString(),
    weight: petData.weight.toString(),
    healthStatus: petData.healthStatus,
  });

  useEffect(() => {
    // Fetch pet data based on id
    console.log("Fetching pet data for id:", id);
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleEditPet = () => {
    setEditForm({
      name: petData.name,
      breed: petData.breed,
      age: petData.age.toString(),
      weight: petData.weight.toString(),
      healthStatus: petData.healthStatus,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setPetData({
      ...petData,
      name: editForm.name,
      breed: editForm.breed,
      age: parseInt(editForm.age) || 0,
      weight: parseFloat(editForm.weight) || 0,
      healthStatus: editForm.healthStatus,
    });
    setShowEditModal(false);
    Alert.alert("Success", "Pet profile updated successfully!");
  };

  const handleDeletePet = () => {
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${petData.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Delete pet logic here
            Alert.alert("Deleted", `${petData.name} has been removed`);
            router.back();
          },
        },
      ]
    );
  };

  const getGenderIcon = (): "gender-male" | "gender-female" => {
    return petData.gender === "male" ? "gender-male" : "gender-female";
  };

  const getGenderColor = () => {
    return petData.gender === "male" ? "#4ECDC4" : "#FF6B6B";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#FFE66D";
      case "completed":
        return "#4ECDC4";
      case "cancelled":
        return "#FF6B6B";
      default:
        return "#999";
    }
  };

  const getAppointmentIcon = (type: string): string => {
    switch (type) {
      case "vet":
        return "stethoscope";
      case "grooming":
        return "scissors";
      case "walk":
        return "dog";
      default:
        return "calendar";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const calculateYearsWithUs = () => {
    const created = new Date(petData.createdAt);
    const today = new Date();
    const years = today.getFullYear() - created.getFullYear();
    return years;
  };

  return (
    <SafeAreaView style={petProfileStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B6B" />}
      >
        {/* Header with Cover Photo */}
        <View style={petProfileStyles.headerContainer}>
          <LinearGradient
            colors={["#FF6B6B", "#FF8E8E", "#FFB88C"]}
            style={petProfileStyles.coverPhoto}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Back Button */}
          <TouchableOpacity style={petProfileStyles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity style={petProfileStyles.editButton} onPress={handleEditPet}>
            <LinearGradient colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]} style={petProfileStyles.editGradient}>
              <Feather name="edit-2" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Avatar */}
          <View style={petProfileStyles.avatarWrapper}>
            <View style={petProfileStyles.avatarContainer}>
              <Image source={{ uri: petData.avatar }} style={petProfileStyles.avatar} />
              <View style={[petProfileStyles.genderBadge, { backgroundColor: getGenderColor() }]}>
                <MaterialCommunityIcons name={getGenderIcon()} size={16} color="#FFF" />
              </View>
            </View>
          </View>

          {/* Pet Name */}
          <Text style={petProfileStyles.petName}>{petData.name}</Text>
          
          {/* Breed & Species */}
          <View style={petProfileStyles.breedContainer}>
            <MaterialCommunityIcons name="dog" size={16} color="#FF6B6B" />
            <Text style={petProfileStyles.breedText}>
              {petData.breed} • {petData.species}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={petProfileStyles.statsContainer}>
          <View style={petProfileStyles.statCard}>
            <MaterialCommunityIcons name="cake-variant" size={24} color="#FF6B6B" />
            <Text style={petProfileStyles.statNumber}>{petData.age}</Text>
            <Text style={petProfileStyles.statLabel}>Years Old</Text>
          </View>
          
          <View style={petProfileStyles.statDivider} />
          
          <View style={petProfileStyles.statCard}>
            <MaterialCommunityIcons name="weight" size={24} color="#4ECDC4" />
            <Text style={petProfileStyles.statNumber}>{petData.weight}</Text>
            <Text style={petProfileStyles.statLabel}>kg</Text>
          </View>
          
          <View style={petProfileStyles.statDivider} />
          
          <View style={petProfileStyles.statCard}>
            <MaterialCommunityIcons name="calendar-heart" size={24} color="#FFE66D" />
            <Text style={petProfileStyles.statNumber}>{calculateYearsWithUs()}</Text>
            <Text style={petProfileStyles.statLabel}>Years With Us</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={petProfileStyles.tabsContainer}>
          <TouchableOpacity
            style={[petProfileStyles.tab, selectedTab === "info" && petProfileStyles.tabActive]}
            onPress={() => setSelectedTab("info")}
          >
            <Feather name="info" size={20} color={selectedTab === "info" ? "#FF6B6B" : "#999"} />
            <Text style={[petProfileStyles.tabText, selectedTab === "info" && petProfileStyles.tabTextActive]}>
              Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[petProfileStyles.tab, selectedTab === "health" && petProfileStyles.tabActive]}
            onPress={() => setSelectedTab("health")}
          >
            <Feather name="heart" size={20} color={selectedTab === "health" ? "#FF6B6B" : "#999"} />
            <Text style={[petProfileStyles.tabText, selectedTab === "health" && petProfileStyles.tabTextActive]}>
              Health
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[petProfileStyles.tab, selectedTab === "appointments" && petProfileStyles.tabActive]}
            onPress={() => setSelectedTab("appointments")}
          >
            <Feather name="calendar" size={20} color={selectedTab === "appointments" ? "#FF6B6B" : "#999"} />
            <Text style={[petProfileStyles.tabText, selectedTab === "appointments" && petProfileStyles.tabTextActive]}>
              Appointments
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {selectedTab === "info" && (
          <View style={petProfileStyles.infoSection}>
            {/* Health Status Card */}
            <LinearGradient colors={["#667EEA", "#764BA2"]} style={petProfileStyles.healthCard}>
              <View style={petProfileStyles.healthHeader}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color="#FFF" />
                <Text style={petProfileStyles.healthTitle}>Health Status</Text>
              </View>
              <Text style={petProfileStyles.healthText}>{petData.healthStatus}</Text>
            </LinearGradient>

            {/* Details Cards */}
            <View style={petProfileStyles.detailsCard}>
              <View style={petProfileStyles.detailItem}>
                <View style={petProfileStyles.detailIcon}>
                  <Feather name="calendar" size={20} color="#FF6B6B" />
                </View>
                <View>
                  <Text style={petProfileStyles.detailLabel}>Member Since</Text>
                  <Text style={petProfileStyles.detailValue}>{formatDate(petData.createdAt)}</Text>
                </View>
              </View>
              
              <View style={petProfileStyles.detailDivider} />
              
              <View style={petProfileStyles.detailItem}>
                <View style={petProfileStyles.detailIcon}>
                  <Feather name="check-circle" size={20} color="#4ECDC4" />
                </View>
                <View>
                  <Text style={petProfileStyles.detailLabel}>Last Checkup</Text>
                  <Text style={petProfileStyles.detailValue}>{formatDate(petData.lastCheckup)}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={petProfileStyles.actionsSection}>
              <Text style={petProfileStyles.sectionTitle}>Quick Actions</Text>
              <View style={petProfileStyles.actionsGrid}>
                <TouchableOpacity style={petProfileStyles.actionCard}>
                  <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={petProfileStyles.actionGradient}>
                    <Feather name="activity" size={24} color="#FFF" />
                    <Text style={petProfileStyles.actionText}>Health Log</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={petProfileStyles.actionCard}>
                  <LinearGradient colors={["#4ECDC4", "#6BE4DC"]} style={petProfileStyles.actionGradient}>
                    <Feather name="camera" size={24} color="#FFF" />
                    <Text style={petProfileStyles.actionText}>Gallery</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={petProfileStyles.actionCard}>
                  <LinearGradient colors={["#FFE66D", "#FFED9E"]} style={petProfileStyles.actionGradient}>
                    <Feather name="bell" size={24} color="#FFF" />
                    <Text style={petProfileStyles.actionText}>Reminders</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={petProfileStyles.actionCard}>
                  <LinearGradient colors={["#A8E6CF", "#7ECBA1"]} style={petProfileStyles.actionGradient}>
                    <Feather name="share-2" size={24} color="#FFF" />
                    <Text style={petProfileStyles.actionText}>Share</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedTab === "health" && (
          <View style={petProfileStyles.healthSection}>
            {/* Vaccinations */}
            <View style={petProfileStyles.vaccinationsCard}>
              <View style={petProfileStyles.sectionHeader}>
                <Text style={petProfileStyles.sectionTitle}>Vaccinations</Text>
                <TouchableOpacity>
                  <Feather name="plus-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
              
              {petData.vaccinations.map((vaccine) => (
                <View key={vaccine.id} style={petProfileStyles.vaccineItem}>
                  <View style={petProfileStyles.vaccineStatus}>
                    {vaccine.completed ? (
                      <Feather name="check-circle" size={20} color="#4ECDC4" />
                    ) : (
                      <Feather name="clock" size={20} color="#FFE66D" />
                    )}
                  </View>
                  <View style={petProfileStyles.vaccineInfo}>
                    <Text style={petProfileStyles.vaccineName}>{vaccine.name}</Text>
                    <Text style={petProfileStyles.vaccineDate}>
                      Last: {formatDate(vaccine.date)} • Next: {formatDate(vaccine.nextDue)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Weight Tracker */}
            <View style={petProfileStyles.weightCard}>
              <Text style={petProfileStyles.sectionTitle}>Weight Tracker</Text>
              <View style={petProfileStyles.weightChart}>
                <Text style={petProfileStyles.weightValue}>{petData.weight} kg</Text>
                <View style={petProfileStyles.weightBar}>
                  <LinearGradient
                    colors={["#4ECDC4", "#6BE4DC"]}
                    style={[petProfileStyles.weightProgress, { width: `${(petData.weight / 40) * 100}%` }]}
                  />
                </View>
                <Text style={petProfileStyles.weightNote}>Ideal weight range: 25-32 kg</Text>
              </View>
            </View>

            {/* Medical Records */}
            <TouchableOpacity style={petProfileStyles.medicalCard}>
              <LinearGradient colors={["#667EEA", "#764BA2"]} style={petProfileStyles.medicalGradient}>
                <View>
                  <Text style={petProfileStyles.medicalTitle}>Medical Records</Text>
                  <Text style={petProfileStyles.medicalSubtitle}>View all medical history</Text>
                </View>
                <Feather name="file-text" size={32} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab === "appointments" && (
          <View style={petProfileStyles.appointmentsSection}>
            {petData.appointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={petProfileStyles.appointmentCard}>
                <View style={petProfileStyles.appointmentStatus}>
                  <View style={[petProfileStyles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
                </View>
                <View style={petProfileStyles.appointmentInfo}>
                  <Text style={petProfileStyles.appointmentTitle}>{appointment.title}</Text>
                  <Text style={petProfileStyles.appointmentDetails}>
                    {formatDate(appointment.date)} • {appointment.time}
                  </Text>
                  <View style={petProfileStyles.appointmentType}>
                    <MaterialCommunityIcons
                      name={getAppointmentIcon(appointment.type) as any}
                      size={14}
                      color="#999"
                    />
                    <Text style={petProfileStyles.appointmentTypeText}>
                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#CCC" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={petProfileStyles.bookButton}>
              <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={petProfileStyles.bookGradient}>
                <Feather name="plus" size={20} color="#FFF" />
                <Text style={petProfileStyles.bookText}>Book New Appointment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity style={petProfileStyles.deleteButton} onPress={handleDeletePet}>
          <Feather name="trash-2" size={20} color="#FF6B6B" />
          <Text style={petProfileStyles.deleteText}>Delete Pet Profile</Text>
        </TouchableOpacity>

        <View style={petProfileStyles.bottomSpacing} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent={true}>
        <View style={petProfileStyles.modalOverlay}>
          <View style={petProfileStyles.modalContent}>
            <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={petProfileStyles.modalHeader}>
              <Text style={petProfileStyles.modalTitle}>Edit Pet Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={petProfileStyles.modalBody}>
              <View style={petProfileStyles.modalInputGroup}>
                <Text style={petProfileStyles.modalLabel}>Name</Text>
                <TextInput
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                  style={petProfileStyles.modalInput}
                  placeholder="Pet name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={petProfileStyles.modalInputGroup}>
                <Text style={petProfileStyles.modalLabel}>Breed</Text>
                <TextInput
                  value={editForm.breed}
                  onChangeText={(text) => setEditForm({ ...editForm, breed: text })}
                  style={petProfileStyles.modalInput}
                  placeholder="Breed"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={petProfileStyles.modalRow}>
                <View style={[petProfileStyles.modalInputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={petProfileStyles.modalLabel}>Age (years)</Text>
                  <TextInput
                    value={editForm.age}
                    onChangeText={(text) => setEditForm({ ...editForm, age: text })}
                    style={petProfileStyles.modalInput}
                    keyboardType="numeric"
                    placeholder="Age"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[petProfileStyles.modalInputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={petProfileStyles.modalLabel}>Weight (kg)</Text>
                  <TextInput
                    value={editForm.weight}
                    onChangeText={(text) => setEditForm({ ...editForm, weight: text })}
                    style={petProfileStyles.modalInput}
                    keyboardType="numeric"
                    placeholder="Weight"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={petProfileStyles.modalInputGroup}>
                <Text style={petProfileStyles.modalLabel}>Health Status</Text>
                <TextInput
                  value={editForm.healthStatus}
                  onChangeText={(text) => setEditForm({ ...editForm, healthStatus: text })}
                  style={[petProfileStyles.modalInput, petProfileStyles.modalTextArea]}
                  multiline
                  numberOfLines={3}
                  placeholder="Health status"
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={petProfileStyles.modalSaveButton} onPress={handleSaveEdit}>
                <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={petProfileStyles.modalSaveGradient}>
                  <Text style={petProfileStyles.modalSaveText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}