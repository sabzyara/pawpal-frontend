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
          paddingVertical: 16,
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
            borderRadius: 999, 
            height: 52, 
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: colors.border.light,
            
            // ↑ added shadow
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.text.secondary}
          />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search specialists..." 
            placeholderTextColor={colors.text.tertiary}
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 8,
              color: colors.text.primary,
              fontSize: 16,
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
            marginLeft: 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.tertiary,
            paddingHorizontal: 16,
            height: 52, 
            borderRadius: 999, 
            borderWidth: 1,
            borderColor: colors.border.light,
            
            // ↑ added shadow
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Ionicons
            name="funnel-outline"
            size={18}
            color={colors.primary.main} 
          />

          <Text
            style={[
              typography.body2,
              {
                marginLeft: 8,
                color: colors.text.primary,
                fontWeight: '500',
              },
            ]}
          >
            {getLabel()}
          </Text>

          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.text.secondary}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </View>

      {/* MODAL - Bottom Sheet Style */}
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
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
            }}
          >
            {/* Bottom Sheet Handle */}
            <View
              style={{
                alignSelf: 'center',
                width: 50,
                height: 5,
                borderRadius: 999,
                backgroundColor: colors.border.medium,
                marginBottom: 20,
              }}
            />
            
            <Text
              style={[
                typography.h3, 
                { 
                  color: colors.text.primary, 
                  marginBottom: 24,
                },
              ]}
            >
              Sort Specialists
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
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    marginBottom: 4,
                    
                    // ↑ active background
                    backgroundColor: isActive
                      ? colors.primary.light + '20'
                      : 'transparent',
                    borderRadius: 16,
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
                      size={22}
                      color={colors.primary.main}
                    />

                    <Text
                      style={[
                        typography.body1,
                        {
                          marginLeft: 12,
                          color: colors.text.primary,
                          fontWeight: isActive ? '600' : '400',
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>

                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
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