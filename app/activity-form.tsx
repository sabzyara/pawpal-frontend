import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function NutritionForm() {
  const { colors } = useTheme();
  const { mode, type, distance, duration, id } = useLocalSearchParams();
  
  const [activityType, setActivityType] = useState( typeof type === 'string' ? type : '' );
  const [distanceValue, setDistanceValue] = useState( typeof distance === 'string' ? distance : '' );
  const [durationValue, setDurationValue] = useState( typeof duration === 'string' ? duration : '' );

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
    ]).start(() => router.back());
  };

  const handleSave = async () => {
    try {
      if (mode === 'edit') {
        //  UPDATE
        console.log('UPDATE', { id, type, distance, duration });

      } else {
        //  CREATE
        console.log('CREATE', { type, distance, duration });

      }

      handleClose();
    } catch (e) {
      console.log('Error:', e);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) handleClose();
        else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'none' }} />

      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <Animated.View style={[styles.overlayBg, { opacity: overlayOpacity }]} />
      </TouchableOpacity>

      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
                backgroundColor: colors.background.primary || '#111',
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.handle} />

            <ThemedView style={styles.header}>
              <ThemedText type="title">
                {mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
              </ThemedText>
            </ThemedView>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ThemedView style={styles.form}>
                <ThemedText style={styles.label}>Activity Type</ThemedText>
                <TextInput 
                value={activityType}
                onChangeText={setActivityType}
                style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
                placeholder="Enter type of activity"
                />

                <ThemedText style={styles.label}>Distance</ThemedText>
                <TextInput 
                value={distanceValue}
                onChangeText={setDistanceValue}
                style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
                placeholder="Enter the distance"
                />

                <ThemedText style={styles.label}>Duration</ThemedText>
                <TextInput 
                value={durationValue}
                onChangeText={setDurationValue}
                style={[styles.input, { backgroundColor: colors.input.background, color: colors.text.primary }]}
                placeholder="Enter duration in minutes"
                keyboardType="numeric"
                />
                
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary.main }]}
                  onPress={handleSave}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {mode === 'edit' ? 'Save Changes' : 'Add'}
                  </ThemedText>
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
  container: { flex: 1, justifyContent: 'flex-end' },

  overlay: { ...StyleSheet.absoluteFillObject },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  sheet: {
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
  },

  handle: {
    width: 120,
    height: 6,
    backgroundColor: '#888',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },

  header: { alignItems: 'center', paddingVertical: 10 },

  form: { paddingHorizontal: 16 },

  label: { marginTop: 16 },

  input: {
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },

  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },

  saveButtonText: { color: '#fff', fontWeight: '600' },
});