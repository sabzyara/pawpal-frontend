import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

interface Pet {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface PetsSectionProps {
  pets: Pet[];
  onAddPress: () => void;
  onPetPress: (petId: number) => void;
}

export const PetsSection: React.FC<PetsSectionProps> = ({
  pets,
  onAddPress,
  onPetPress,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  return (
    <View style={styles.petsSection}>
      
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" ,marginBottom: 12 , paddingHorizontal: 20}}>
        <Text style={styles.sectionTitle}>My Pets</Text>

        <TouchableOpacity onPress={onAddPress}>
          <Feather name="plus" size={20} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {pets.length === 0 && (
        <TouchableOpacity
          onPress={onAddPress}
          style={{
            marginTop: 12,
            padding: 20,
            borderRadius: 16,
            backgroundColor: colors.background.secondary,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text.secondary }}>
            Add your first pet 🐾
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={pets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: 12,
        paddingHorizontal: 16, }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPetPress(item.id)}
            style={{
              marginRight: 16,
              alignItems: "center",
              
            }}
          >
            {/* AVATAR */}
            <Image
              source={{
                uri:
                  item.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/51тз2/616/616408.png",
              }}
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                marginBottom: 6,
              }}
            />

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text.primary,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};