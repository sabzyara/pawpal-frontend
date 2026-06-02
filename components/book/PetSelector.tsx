import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  avatarUrl: string;
  medicalHistory?: string[];
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string;
  onSelectPet: (petId: string) => void;
}

export const PetSelector: React.FC<PetSelectorProps> = ({
  pets,
  selectedPetId,
  onSelectPet,
}) => {
  const { colors, typography } = useTheme();

  const getPetIcon = (type: string) => {
    return type === 'Dog' ? '🐕' : '🐈';
  };

  const PetCard = ({ pet }: { pet: Pet }) => {
    const isSelected = selectedPetId === pet.id;

    return (
      <TouchableOpacity
        onPress={() => onSelectPet(pet.id)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isSelected ? colors.primary.main + '15' : colors.card.default,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.primary.main : colors.border.light,
        }}
      >
        <Image
          source={{ uri: pet.avatarUrl }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            marginRight: 16,
          }}
        />
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[typography.h4, { color: colors.text.primary }]}>
              {pet.name}
            </Text>
            <Text style={{ fontSize: 20 }}>{getPetIcon(pet.type)}</Text>
          </View>
          
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {pet.breed} • {pet.age} years • {pet.weight} kg
          </Text>
          
          {pet.medicalHistory && pet.medicalHistory.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {pet.medicalHistory.map((item, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.background.tertiary,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}
                >
                  <Text style={[typography.caption, { fontSize: 10, color: colors.text.secondary }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary.main} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: 8 }]}>
        Выберите питомца
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginBottom: 20 }]}>
        Выберите питомца для приема
      </Text>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PetCard pet={item} />}
        scrollEnabled={false}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 40,
              backgroundColor: colors.card.default,
              borderRadius: 16,
            }}
          >
            <Ionicons name="paw-outline" size={48} color={colors.text.secondary} />
            <Text style={[typography.body1, { color: colors.text.primary, marginTop: 12 }]}>
              Нет добавленных питомцев
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 16,
                paddingVertical: 8,
                paddingHorizontal: 20,
                backgroundColor: colors.primary.main,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: colors.text.inverse }}>Добавить питомца</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};