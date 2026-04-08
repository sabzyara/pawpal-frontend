// screens/home/components/PetsSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';

interface PetsSectionProps {
  pets: string[];
  onAddPress: () => void;
  onPetPress: (pet: string) => void;
}

const PET_IMAGES = [
  "https://images.unsplash.com/photo-1552053831-7158f46f0c79?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop",
];

export const PetsSection: React.FC<PetsSectionProps> = ({
  pets,
  onAddPress,
  onPetPress,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  if (pets.length === 0) {
    return (
      <View style={styles.petsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Pets</Text>
          <TouchableOpacity onPress={onAddPress}>
            <Feather name="plus-circle" size={24} color={colors.primary.main} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.emptyPetsCard} onPress={onAddPress}>
          <Feather name="plus" size={32} color={colors.text.secondary} />
          <Text style={styles.emptyPetsText}>Add your first pet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.petsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Pets</Text>
        <TouchableOpacity onPress={onAddPress}>
          <Feather name="plus-circle" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={pets}
        keyExtractor={(item, index) => `${item}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.petsListContent}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => onPetPress(item)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.background.primary, colors.background.secondary]}
              style={styles.petCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.petImageContainer}>
                <Image
                  source={{ uri: PET_IMAGES[index % PET_IMAGES.length] }}
                  style={styles.petImage}
                />
              </View>
              <Text style={styles.petName}>{item}</Text>
              <View style={styles.petStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.petStatusText}>Active</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};