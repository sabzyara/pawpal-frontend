import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function AdminUserProfile() {
  const { id } = useLocalSearchParams();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get(
        `/user-service/admin/users/${id}/profile`
      );

      setData(res.data);
    } catch (e) {
      console.log(e);
    }
  };

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
      <Text style={styles.title}>User Profile</Text>

      {/* OWNER */}
      {data.owner && (
        <View style={styles.card}>
          <Text style={styles.section}>Owner Info</Text>

          <Text style={styles.label}>
            Username: {data.owner.username}
          </Text>

          <Text style={styles.label}>
            Phone: {data.owner.phoneNumber}
          </Text>

          <Text style={styles.label}>
            Address: {data.owner.address}
          </Text>
        </View>
      )}

      {/* PETS */}
      {data.pets && (
        <View style={styles.card}>
          <Text style={styles.section}>Pets</Text>

          {data.pets.map((pet: any) => (
            <View key={pet.id} style={styles.petCard}>
              <Text style={styles.petName}>{pet.name}</Text>

              <Text style={styles.label}>
                Species: {pet.species}
              </Text>

              <Text style={styles.label}>
                Breed: {pet.breed}
              </Text>

              <Text style={styles.label}>
                Age: {pet.age}
              </Text>

              <Text style={styles.label}>
                Weight: {pet.weight}
              </Text>

              <Text style={styles.label}>
                Health: {pet.healthStatus}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* VET */}
      {data.specialization && (
        <View style={styles.card}>
          <Text style={styles.section}>Veterinarian</Text>

          <Text style={styles.label}>
            Name: {data.fullName}
          </Text>

          <Text style={styles.label}>
            Specialization: {data.specialization}
          </Text>

          <Text style={styles.label}>
            Experience: {data.experience}
          </Text>
        </View>
      )}

      {/* SERVICE */}
      {data.businessName && (
        <View style={styles.card}>
          <Text style={styles.section}>Service Provider</Text>

          <Text style={styles.label}>
            Business: {data.businessName}
          </Text>

          <Text style={styles.label}>
            Address: {data.address}
          </Text>
        </View>
      )}

      {/* ACTIONS */}
      <TouchableOpacity
        style={styles.approveBtn}
        onPress={approveUser}
      >
        <Text style={styles.btnText}>Approve</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.rejectBtn}
        onPress={rejectUser}
      >
        <Text style={styles.btnText}>Reject</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={deleteUser}
      >
        <Text style={styles.btnText}>Delete User</Text>
      </TouchableOpacity>
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

    deleteBtn: {
      backgroundColor: "red",
      padding: 14,
      borderRadius: 12,
      marginBottom: 40,
    },

    btnText: {
      color: "white",
      textAlign: "center",
      fontWeight: "700",
    },
  });