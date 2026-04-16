import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { router, Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, PanResponder, Platform, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function AddNutritionScreen() {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(500)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return gesture.dy > 5; 
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <Animated.View 
          style={[
            styles.overlayBackground,
            { opacity: overlayOpacity }
          ]} 
        />
      </TouchableOpacity>

      <View style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <Animated.View 
            style={[
              styles.sheet, 
              { 
                transform: [{ translateY }],
                backgroundColor: colors.background.primary || '#111'
              }
            ]} 
          >
            <View {...panResponder.panHandlers} style={styles.handle} />

            <ThemedView style={styles.header}>
              <ThemedText type="title">Add Activity</ThemedText>
            </ThemedView>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ThemedView style={styles.form}>
                
                <ThemedText style={styles.label}>Activity Type</ThemedText>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
                  placeholder="Enter type of actiivity"
                  placeholderTextColor={colors.text.tertiary}
                />
          
                <ThemedText style={styles.label}>Distance</ThemedText>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
                  placeholder="Enter the distance"
                  placeholderTextColor={colors.text.tertiary}
                />
          
                <ThemedText style={styles.label}>Duration</ThemedText>
                <TextInput 
                  style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
                  placeholder="Enter the duration in minutes"
                  placeholderTextColor={colors.text.tertiary}
                />
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.primary.main }]}
                  onPress={handleClose}
                >
                  <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 5,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 5, 
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    padding: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    zIndex: 2,
  },
  handle: {
    width: 120,
    height: 6,
    backgroundColor: '#888',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
});