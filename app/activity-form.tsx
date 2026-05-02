import { ThemedText } from '@/components/themed-text';
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
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function NutritionForm() {
  const { colors } = useTheme();
  const styles = createStyles(colors);  
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
                transform: [{ translateY }]              
              },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'edit' ? 'Edit Activity' : 'Add Activity'}
              </Text>
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.form}>
                <Text style={styles.label}>Activity Type</Text>
                <TextInput 
                value={activityType}
                onChangeText={setActivityType}
                style={styles.input}
                placeholder="Enter type of activity"
                />

                <Text style={styles.label}>Distance</Text>
                <TextInput 
                value={distanceValue}
                onChangeText={setDistanceValue}
                style={styles.input}
                placeholder="Enter the distance"
                />

                <Text style={styles.label}>Duration</Text>
                <TextInput 
                value={durationValue}
                onChangeText={setDurationValue}
                style={styles.input}
                placeholder="Enter duration in minutes"
                keyboardType="numeric"
                />
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {mode === 'edit' ? 'Save Changes' : 'Add'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    title: {
      fontSize: 26,
      fontWeight: '700',
      textAlign: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
    },

    overlayBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)', // можно оставить
    },

    sheet: {
      padding: 16,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      minHeight: '50%',
      backgroundColor: colors.background.primary,
    },

    handle: {
      width: 150,
      height: 6,
      backgroundColor: colors.border.medium,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 12,
    },

    header: {
      alignItems: 'center',
      paddingVertical: 10,
    },

    form: {
      paddingHorizontal: 16,
    },

    label: {
      marginTop: 16,
      color: colors.text.secondary,
      fontSize: 13,
    },

    input: {
      padding: 14,
      borderRadius: 12,
      marginTop: 6,

      backgroundColor: colors.input.background,
      borderWidth: 1,
      borderColor: colors.input.border,
      color: colors.text.primary,
    },

    saveButton: {
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 10,
      backgroundColor: colors.primary.main,
    },

    saveButtonText: {
      color: colors.text.inverse,
      fontWeight: '600',
      fontSize: 15,
    },
  });