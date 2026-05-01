import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export const FloatingChatButton = () => {
  const { colors } = useTheme();

  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push("/chat")}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubble-ellipses" size={24} color='#FFFFFF' />
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 30,
      width: 60,
      height: 60,
      borderRadius: 30,

      backgroundColor: colors.primary.main,

      justifyContent: 'center',
      alignItems: 'center',

      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
  });