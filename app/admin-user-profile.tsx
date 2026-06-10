import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, PawPrint, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AdminUserProfile() {
  const { id } = useLocalSearchParams();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // const fetchProfile = async () => {
  //   try {
  //     const res = await api.get(
  //       `/user-service/admin/users/${id}/profile`
  //     );

  //     setData(res.data);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };
    //
  const [loading, setLoading] = useState(true);

const fetchProfile = async () => {
    try {
      const res = await api.get(
        `/user-service/admin/users/${id}/profile`
      );

      console.log(
        "PROFILE DATA:",
        JSON.stringify(res.data, null, 2)
      );

      setData(res.data);

    } catch (e: any) {
      console.log("STATUS:", e?.response?.status);
      console.log("DATA:", e?.response?.data);
      console.log("ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No data found</Text>
      </View>
    );
  }
//

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary.main} />
      </View>
    );
  }

  const approveUser = async () => {
    try {
      await api.put(
        `/user-service/admin/users/${id}/approve`
      );

      alert("Approved");
    } catch (e) {
      console.log(e);
    }
  };

  const rejectUser = async () => {
    try {
      await api.put(
        `/user-service/admin/users/${id}/reject`
      );

      alert("Rejected");
    } catch (e) {
      console.log(e);
    }
  };

  const deleteUser = async () => {
    try {
      await api.delete(
        `/user-service/admin/users/${id}`
      );

      alert("Deleted");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>User Profile</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* OWNER */}
        {data.owner && (
          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <User size={24} color={colors.primary.main} />
              <Text style={styles.section}>Owner Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{data.owner.username}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{data.owner.phoneNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{data.owner.address}</Text>
            </View>
          </View>
        )}

        {/* PETS */}
        {data.pets && (
          <View style={styles.card}>
            <View style={styles.ownerHeader}>
              <PawPrint size={22} color={colors.primary.main} />
              <Text style={styles.section}>Pets</Text>
            </View>

            {data.pets.map((pet: any) => (
              <View key={pet.id} style={styles.petTable}>
                <Text style={styles.petTitle}>{pet.name}</Text>

                <View style={styles.tableRow}>
                  <Text style={styles.tableKey}>Species</Text>
                  <Text style={styles.tableValue}>{pet.species}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableKey}>Breed</Text>
                  <Text style={styles.tableValue}>{pet.breed}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableKey}>Age</Text>
                  <Text style={styles.tableValue}>{pet.age}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableKey}>Weight</Text>
                  <Text style={styles.tableValue}>{pet.weight} kg</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableKey}>Health</Text>
                  <Text style={styles.tableValue}>{pet.healthStatus}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* VET */}
        {data.licenseNumber && (
          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <User size={24} color={colors.primary.main} />
              <Text style={styles.section}>Veterinarian Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name</Text>
              <Text style={styles.infoValue}>{data.firstName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name</Text>
              <Text style={styles.infoValue}>{data.lastName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{data.phoneNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License Number</Text>
              <Text style={styles.infoValue}>{data.licenseNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Clinic Name</Text>
              <Text style={styles.infoValue}>{data.clinicName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience Years</Text>
              <Text style={styles.infoValue}>{data.experienceYears}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Education</Text>
              <Text style={styles.infoValue}>{data.education}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rating Average</Text>
              <Text style={styles.infoValue}>{data.ratingAverage}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reviews Count</Text>
              <Text style={styles.infoValue}>{data.reviewsCount}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{data.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{data.city}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price per visit</Text>
              <Text style={styles.infoValue}>{data.pricePerVisit}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>{data.about}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient Count</Text>
              <Text style={styles.infoValue}>{data.patientsCount}</Text>
            </View>
          </View>
        )}

        {/* SERVICE */}
        {data.serviceCategory && (
          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <User size={24} color={colors.primary.main} />
              <Text style={styles.section}>Service Provider Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name</Text>
              <Text style={styles.infoValue}>{data.firstName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name</Text>
              <Text style={styles.infoValue}>{data.lastName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{data.phoneNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Category</Text>
              <Text style={styles.infoValue}>{data.serviceCategory}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience Years</Text>
              <Text style={styles.infoValue}>{data.experienceYears}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Education</Text>
              <Text style={styles.infoValue}>{data.education}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rating Average</Text>
              <Text style={styles.infoValue}>{data.ratingAverage}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reviews Count</Text>
              <Text style={styles.infoValue}>{data.reviewsCount}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{data.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{data.city}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price per visit</Text>
              <Text style={styles.infoValue}>{data.pricePerVisit}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>{data.about}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient Count</Text>
              <Text style={styles.infoValue}>{data.patientsCount}</Text>
            </View>
          </View>
        )} 

        {/* ACTIONS */}
        {/* <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            router.push(`/edit_user?id=${id}`);
          }}
        >
          <Edit3 size={18} color="#fff" />
          <Text style={styles.btnText}>Edit User</Text>
        </TouchableOpacity> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
      padding: 16,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 20,
    },

    card: {
      backgroundColor: colors.card.default,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
    },

    section: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
      color: colors.text.primary,
    },

    label: {
      fontSize: 14,
      marginBottom: 6,
      color: colors.text.primary,
    },

    petCard: {
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.background.secondary,
    },

    petName: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
      color: colors.text.primary,
    },

    approveBtn: {
      backgroundColor: "green",
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
    },

    rejectBtn: {
      backgroundColor: "orange",
      padding: 14,
      borderRadius: 12,
      marginBottom: 12,
    },

    // deleteBtn: {
    //   backgroundColor: "red",
    //   padding: 14,
    //   borderRadius: 12,
    //   marginBottom: 40,
    // },

    btnText: {
      color: "white",
      textAlign: "center",
      fontWeight: "700",
    },
    
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card.elevated,
      justifyContent: "center",
      alignItems: "center",
    },

    ownerCard: {
      backgroundColor: colors.card.default,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },

    ownerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },

    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },

    infoLabel: {
      color: colors.text.secondary,
      fontSize: 14,
    },

    infoValue: {
      color: colors.text.primary,
      fontWeight: "600",
    },

    petTable: {
      marginTop: 12,
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      padding: 14,
    },

    petTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.primary.main,
      marginBottom: 10,
    },

    tableRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },

    tableKey: {
      color: colors.text.secondary,
      fontWeight: "500",
    },

    tableValue: {
      color: colors.text.primary,
      fontWeight: "600",
    },

    editBtn: {
      backgroundColor: colors.primary.main,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },

    deleteBtn: {
      backgroundColor: colors.error.main,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginTop: 12,
      marginBottom: 30,
    },
    scrollContent: {
      paddingBottom: 40,
    },
  });