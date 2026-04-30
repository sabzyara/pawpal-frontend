import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { petProfileStyles } from "@/styles/petScreenStyle";
import api from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";

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
      <SafeAreaView style={petProfileStyles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={petProfileStyles.container}>
        <Text>Pet not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={petProfileStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={petProfileStyles.headerContainer}>
          <LinearGradient
            colors={["#FF7A7A", "#FFB3B3"]}
            style={petProfileStyles.coverPhoto}
          />

          {/* BACK */}
          <TouchableOpacity
            style={petProfileStyles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* EDIT */}
          <TouchableOpacity
            style={petProfileStyles.editButton}
            onPress={() =>
              router.push({
                pathname: "/edit_pet",
                params: { id: pet.id },
              })
            }
          >
            <LinearGradient
              colors={["#FF7A7A", "#FFB3B3"]}
              style={petProfileStyles.editGradient}
            >
              <Feather name="edit" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* AVATAR */}
          <View style={petProfileStyles.avatarWrapper}>
            <Image
              source={{
                uri:
                  pet.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
              }}
              style={petProfileStyles.avatar}
            />
          </View>

          <Text style={petProfileStyles.petName}>{pet.name}</Text>

          <Text style={petProfileStyles.breedText}>
            {pet.breed || "—"} • {pet.species}
          </Text>
        </View>

        {/* STATS */}
        <View style={petProfileStyles.statsContainer}>
          <View style={petProfileStyles.statCard}>
            <MaterialCommunityIcons name="cake-variant" size={24} />
            <Text style={petProfileStyles.statNumber}>{pet.age}</Text>
            <Text style={petProfileStyles.statLabel}>Years</Text>
          </View>

          <View style={petProfileStyles.statDivider} />

          <View style={petProfileStyles.statCard}>
            <MaterialCommunityIcons name="weight" size={24} />
            <Text style={petProfileStyles.statNumber}>{pet.weight}</Text>
            <Text style={petProfileStyles.statLabel}>kg</Text>
          </View>
        </View>

        {/* DETAILS */}
        <View style={petProfileStyles.infoSection}>
          <Text style={petProfileStyles.sectionTitle}>Details</Text>

          <View style={petProfileStyles.detailsCard}>
            <View style={petProfileStyles.detailItem}>
              <View style={petProfileStyles.detailIcon}>
                <Feather name="tag" size={16} />
              </View>
              <View>
                <Text style={petProfileStyles.detailLabel}>Breed</Text>
                <Text style={petProfileStyles.detailValue}>
                  {pet.breed || "—"}
                </Text>
              </View>
            </View>

            <View style={petProfileStyles.detailDivider} />

            <View style={petProfileStyles.detailItem}>
              <View style={petProfileStyles.detailIcon}>
                <Feather name="user" size={16} />
              </View>
              <View>
                <Text style={petProfileStyles.detailLabel}>Gender</Text>
                <Text style={petProfileStyles.detailValue}>
                  {pet.gender}
                </Text>
              </View>
            </View>

            <View style={petProfileStyles.detailDivider} />

            <View style={petProfileStyles.detailItem}>
              <View style={petProfileStyles.detailIcon}>
                <Feather name="activity" size={16} />
              </View>
              <View>
                <Text style={petProfileStyles.detailLabel}>Species</Text>
                <Text style={petProfileStyles.detailValue}>
                  {pet.species}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* HEALTH */}
        <View style={petProfileStyles.infoSection}>
          <LinearGradient
            colors={["#4ECDC4", "#6EE7B7"]}
            style={petProfileStyles.healthCard}
          >
            <View style={petProfileStyles.healthHeader}>
              <Feather name="heart" size={18} color="#FFF" />
              <Text style={petProfileStyles.healthTitle}>Health</Text>
            </View>

            <Text style={petProfileStyles.healthText}>
              {pet.healthStatus}
            </Text>
          </LinearGradient>
        </View>

        {/* DELETE */}
        <TouchableOpacity
          style={petProfileStyles.deleteButton}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={18} color="#FF6B6B" />
          <Text style={petProfileStyles.deleteText}>Delete Pet</Text>
        </TouchableOpacity>

        <View style={petProfileStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}