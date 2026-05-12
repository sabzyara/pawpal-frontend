import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number;
  weight: number;
  healthStatus: string;
  avatarUrl?: string;
}

export default function PetProfileScreen() {
  const { id } = useLocalSearchParams();
  const petId = Array.isArray(id) ? id[0] : id;

  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const fetchPet = async () => {
    try {
      const res = await api.get(
        `/pet-management/api/pets/pet/${petId}/full`
      );

      const data = res.data.pet;

      setPet({
        id: data.id.toString(),
        name: data.name,
        species: data.species,
        breed: data.breed,
        gender: data.gender,
        age: data.age,
        weight: data.weight,
        healthStatus: data.healthStatus,
        avatarUrl: data.avatarUrl,
      });
    } catch (e) {
      console.log("ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
  useCallback(() => {
    if (petId) {
      fetchPet();
    }
  }, [petId])
);

  const handleDelete = () => {
    Alert.alert("Delete Pet", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await api.delete(`/pet-management/api/pets/${pet?.id}`);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 20,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Feather
              name="arrow-left"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/edit_pet",
                params: { id: pet.id },
              })
            }
          >
            <Feather
              name="edit-2"
              size={22}
              color={colors.primary.main}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Image
            source={{
              uri:
                pet.avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/616/616408.png",
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 12,
              borderWidth: 4,
              borderColor: colors.border.light,
            }}
          />

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: colors.text.primary,
            }}
          >
            {pet.name}
          </Text>

          <Text
            style={{
              marginTop: 4,
              fontSize: 15,
              color: colors.text.secondary,
            }}
          >
            {pet.breed || "—"} • {pet.species}
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="cake-variant" size={24} color={colors.primary.main} />
            <Text style={styles.statNumber}>{pet.age}</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="weight" size={24} color={colors.primary.main} />
            <Text style={styles.statNumber}>{pet.weight}</Text>
            <Text style={styles.statLabel}>kg</Text>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Feather name="tag" size={30} color={colors.primary.main} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Breed</Text>
                <Text style={styles.detailValue}>
                  {pet.breed || "—"}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Feather name="user" size={30} color={colors.primary.main} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>
                  {pet.gender}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Feather name="activity" size={30} color={colors.primary.main} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Species</Text>
                <Text style={styles.detailValue}>
                  {pet.species}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* HEALTH */}
        <View style={styles.infoSection}>
          <View style={styles.healthCard}>
            
            <View style={styles.healthTop}>
              <View style={styles.healthIconWrapper}>
                <Feather
                  name="heart"
                  size={18}
                  color={colors.primary.main}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.healthTitle}>
                  Health Status
                </Text>

                <Text style={styles.healthSubtitle}>
                  Current pet condition
                </Text>
              </View>
            </View>

            <View style={styles.healthDivider} />

            <Text style={styles.healthText}>
              {pet.healthStatus || "No health information provided"}
            </Text>
          </View>
        </View>

        {/* DELETE */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={18} color="#FF6B6B" />
          <Text style={styles.deleteText}>Delete Pet</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },

    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },

    profileSection: {
      alignItems: "center",
      marginBottom: 28,
      paddingHorizontal: 20,
    },

    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 14,
      borderWidth: 4,
      borderColor: colors.border.light,
      backgroundColor: colors.card.elevated,
    },

    petName: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 4,
    },

    breedText: {
      fontSize: 15,
      color: colors.text.secondary,
    },

    statsContainer: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 24,
      borderRadius: 24,
      backgroundColor: colors.card.default,
      borderWidth: 1,
      borderColor: colors.border.light,
      overflow: "hidden",
    },

    statCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 22,
    },

    statDivider: {
      width: 1,
      backgroundColor: colors.border.light,
    },

    statNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
      marginTop: 8,
    },

    statLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 2,
    },

    infoSection: {
      marginBottom: 24,
      paddingHorizontal: 20,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 14,
    },

    detailsCard: {
      backgroundColor: colors.card.default,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.light,
      overflow: "hidden",
    },

    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 18,
    },

    detailIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      backgroundColor: colors.background.secondary,
    },

    detailLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 2,
    },

    detailValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },

    detailDivider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginLeft: 70,
    },

    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 20,
      marginTop: 8,
      paddingVertical: 16,
      borderRadius: 18,
      backgroundColor: colors.card.default,
      borderWidth: 1,
      borderColor: colors.border.light,
    },

    deleteText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary.main,
      marginLeft: 8,
    },

    bottomSpacing: {
      height: 40,
    },
    healthCard: {
      backgroundColor: colors.card.default,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border.light,
      padding: 20,
    },

    healthTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    healthIconWrapper: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      backgroundColor: colors.background.secondary,
    },

    healthTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text.primary,
    },

    healthSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: colors.text.secondary,
    },

    healthDivider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginVertical: 16,
    },

    healthText: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.text.primary,
    },
  });