// screens/home/HomeScreen.tsx
import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGreeting } from '@/hooks/useGreeting';
import { useSchedule } from '@/hooks/useSchedule';
import { useNotifications } from '@/hooks/useNotifications';
import { HomeHeader } from '@/components/home/Header';
import { StatsCards } from '@/components/home/StatsCard';
import { CalendarSection } from '@/components/home/Calendar';
import { PetsSection } from '@/components/home/PetsList';
import { ScheduleSection } from '@/components/home/ScheduleSection';
import { LearnCard } from '@/components/home/LearnCard';
import { createHomeStyles } from '@/styles/homeStyles';
import { ScheduleItem, SCHEDULE_TYPES_CONFIG } from '@/types/home_index';
import { FloatingChatButton } from '@/components/home/FloatingChatButton';
import { useState, useEffect } from "react"; 
import api from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  const { greeting, userName } = useGreeting();
  const {
    selectedDate,
    refreshing,
    filteredSchedule,
    upcomingTasks,
    completedTasks,
    setSelectedDate,
    toggleDone,
    onRefresh,
  } = useSchedule();

  useNotifications(filteredSchedule);

  const handleTaskPress = (item: ScheduleItem) => {
    const route = SCHEDULE_TYPES_CONFIG[item.type].route;
    router.push(route as any);
  };

  

  const handlePetPress = (id: number) => {
  console.log("GO TO PET:", id);

  router.push({
    pathname: "/pet",
    params: { id },
  });
};

  const handleAddPet = () => {
    router.push("/add");
  };

  const handleAddTask = () => {
    router.push("/add");
  };

  const handleViewAllSchedule = () => {
    router.push("/tracker");
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };
  const [pets, setPets] = useState([]);
 const fetchPets = async () => {
  try {
    const res = await api.get("/pet-management/api/pets");

    const data = Array.isArray(res.data)
      ? res.data.map((p: any) => p.pet ?? p)
      : [];

    setPets(data);
  } catch (e) {
    console.log(e);
  }
};

useFocusEffect(
  React.useCallback(() => {
    fetchPets();
  }, [])
);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        <View style={styles.container}>
          <HomeHeader
            greeting={greeting}
            userName={userName}
            notificationCount={upcomingTasks}
            onNotificationPress={handleNotificationPress}
          />

          <StatsCards
            totalPets={pets.length}
            completedTasks={completedTasks}
            pendingTasks={upcomingTasks}
          />

          <CalendarSection
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          <PetsSection
            pets={pets}
            onAddPress={handleAddPet}
            onPetPress={handlePetPress}
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