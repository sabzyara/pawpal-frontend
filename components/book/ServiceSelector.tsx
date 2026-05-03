import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string;
  onSelectService: (serviceId: string) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServiceId,
  onSelectService,
}) => {
  const { colors, spacing, typography } = useTheme();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'checkup': return 'medical';
      case 'vaccination': return 'medkit';
      case 'surgery': return 'bandage';
      case 'dental': return 'happy';
      case 'emergency': return 'alert-circle';
      default: return 'medkit';
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const isSelected = selectedServiceId === service.id;

    return (
      <TouchableOpacity
        onPress={() => onSelectService(service.id)}
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
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.background.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <Ionicons
            name={getCategoryIcon(service.category) as any}
            size={24}
            color={colors.primary.main}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>
            {service.name}
          </Text>
          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: 2 }]}>
            {service.description}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 8, gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
              <Text style={[typography.caption, { color: colors.text.secondary }]}>
                {service.duration} min
              </Text>
            </View>
            <Text style={[typography.body1SemiBold, { color: colors.primary.main }]}>
              ${service.price}
            </Text>
          </View>
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
        Select Service
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginBottom: 20 }]}>
        Choose the type of service you need
      </Text>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ServiceCard service={item} />}
        scrollEnabled={false}
      />
    </View>
  );
};