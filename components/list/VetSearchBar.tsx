import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface VetSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'rating' | 'experience' | 'price' | 'available';
  setSortBy: (sort: 'rating' | 'experience' | 'price' | 'available') => void;
}

export const VetSearchBar: React.FC<VetSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}) => {
  const { colors, typography } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const options = [
    { value: 'rating', label: 'Top Rated', icon: 'star-outline' },
    { value: 'experience', label: 'Most Experienced', icon: 'school-outline' },
    { value: 'price', label: 'Lowest Price', icon: 'cash-outline' },
    { value: 'available', label: 'Available Today', icon: 'checkmark-circle-outline' },
  ];

  const getLabel = () => {
    return options.find(o => o.value === sortBy)?.label || 'Sort';
  };

  const handleSelect = (value: any) => {
    setSortBy(value);
    setModalVisible(false);
  };

  return (
    <>
      {/* TOP BAR */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.primary,
          alignItems: 'center',
        }}
      >
        {/* SEARCH */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.tertiary,
            borderRadius: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.text.secondary}
          />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor={colors.text.tertiary}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 8,
              color: colors.text.primary,
              fontSize: 15,
            }}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTER BUTTON */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          style={{
            marginLeft: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.tertiary,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={colors.text.primary}
          />

          <Text
            style={[
              typography.body2,
              {
                marginLeft: 6,
                color: colors.text.primary,
              },
            ]}
          >
            {getLabel()}
          </Text>

          <Ionicons
            name="chevron-down"
            size={14}
            color={colors.text.secondary}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={[
                typography.h4,
                { color: colors.text.primary, marginBottom: 16 },
              ]}
            >
              Sort & Filter
            </Text>

            {options.map((option) => {
              const isActive = sortBy === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={colors.primary.main}
                    />

                    <Text
                      style={[
                        typography.body1,
                        {
                          marginLeft: 10,
                          color: colors.text.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>

                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary.main}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};