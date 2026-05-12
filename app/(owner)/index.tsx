
// screens/home/HomeScreen.tsx

import { CalendarSection } from '@/components/home/Calendar';
import { FloatingChatButton } from '@/components/home/FloatingChatButton';
import { HomeHeader } from '@/components/home/Header';
import { LearnCard } from '@/components/home/LearnCard';
import { PetsSection } from '@/components/home/PetsList';
import { ScheduleSection } from '@/components/home/ScheduleSection';

import { useGreeting } from '@/hooks/useGreeting';
import { useNotifications } from '@/hooks/useNotifications';
import { useSchedule } from '@/hooks/useSchedule';
import { useTheme } from '@/hooks/useTheme';

import api from "@/services/api";
import { createHomeStyles } from '@/styles/homeStyles';
import { SCHEDULE_TYPES_CONFIG, ScheduleItem } from '@/types/home_index';

import { useFocusEffect } from "@react-navigation/native";
import { router } from 'expo-router';

import React, { useState, useCallback } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 🔥 ВАЖНО
import { useProfileStore } from '@/store/profileStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  const { greeting } = useGreeting();

  const {
    selectedDate,
    refreshing,
    filteredSchedule,
    upcomingTasks,
    setSelectedDate,
    toggleDone,
    onRefresh,
  } = useSchedule();

  useNotifications(filteredSchedule);

  // 🔥 ПЕТЫ
  const [pets, setPets] = useState<any[]>([]);

  const fetchPets = async () => {
    try {
      const res = await api.get("/pet-management/api/pets");
      const data = Array.isArray(res.data)
        ? res.data.map((p: any) => p.pet ?? p)
        : [];
      setPets(data);
    } catch (e) {
      console.log("PET ERROR:", e);
    }
  };

  // 🔥 ПРОФИЛЬ ИЗ STORE (КАК В PROFILE SCREEN)
  const { profile, fetchProfile } = useProfileStore();

  // 🔄 ОБНОВЛЕНИЕ
  useFocusEffect(
    useCallback(() => {
      fetchPets();
      fetchProfile(); // 🔥 вот ключ
    }, [])
  );

  // 🧠 ИМЯ
  const getDisplayName = () => {
    if (profile?.petOwner?.username) return profile.petOwner.username;

    if (profile?.veterinarian?.firstName) {
      return `${profile.veterinarian.firstName} ${profile.veterinarian.lastName}`;
    }

    if (profile?.serviceProvider?.firstName) {
      return `${profile.serviceProvider.firstName} ${profile.serviceProvider.lastName}`;
    }

    return profile?.user?.email?.split("@")[0] || "User";
  };

  // handlers
  const handlePetPress = (id: number) => {
    router.push({ pathname: "/pet", params: { id } });
  };

  const handleAddPet = () => router.push("/add");
  const handleAddTask = () => router.push("/add");
  const handleViewAllSchedule = () => router.push("/tracker");
  const handleNotificationPress = () => router.push("/notifications");

  const handleTaskPress = (item: ScheduleItem) => {
    const route = SCHEDULE_TYPES_CONFIG[item.type].route;
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      ```tsx id="home_fixed_clean"
<HomeHeader
  greeting={greeting}
  userName={getDisplayName()}
  avatarUrl={
    profile?.petOwner?.avatarUrl ||
    profile?.veterinarian?.avatarUrl ||
    profile?.serviceProvider?.avatarUrl ||
    null
  }
  notificationCount={upcomingTasks}
  onNotificationPress={handleNotificationPress}
/>
```


      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              onRefresh();
              fetchPets();
              fetchProfile(); // 🔥 синхронно с профилем
            }}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        <View style={styles.container}>

          <PetsSection
            pets={pets}
            onAddPress={handleAddPet}
            onPetPress={handlePetPress}
          />

          <CalendarSection
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <ScheduleSection
            schedule={filteredSchedule}
            onTaskPress={handleTaskPress}
            onToggleDone={toggleDone}
            onViewAllPress={handleViewAllSchedule}
            onAddTaskPress={handleAddTask}
          />

          <LearnCard onPress={() => router.push("/learn")} />
        </View>
      </ScrollView>

      <FloatingChatButton />
    </SafeAreaView>
  );
}

