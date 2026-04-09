// screens/home/HomeScreen.tsx
import React from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePets } from "@/store/petStore";
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);
  const { pets } = usePets();
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

  const handlePetPress = (pet: string) => {
    router.push({ pathname: "/pet", params: { petName: pet } });
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