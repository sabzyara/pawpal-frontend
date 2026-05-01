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
import { usePets } from "@/store/petStore";
import { createHomeStyles } from '@/styles/homeStyles';
import { SCHEDULE_TYPES_CONFIG, ScheduleItem } from '@/types/home_index';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
            {/* <View
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              margin: 16,
              borderRadius: 16,
              backgroundColor: colors.card.elevated,
              borderWidth: 1,
              borderColor: colors.border.medium,
              }}
            >
      
              <Image
                source={{ uri: getAvatarUrl() }}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  marginRight: 16,
                }}
              />
            
           
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.text.primary,
                    marginBottom: 4,
                  }}
                >
                  {getDisplayName()}
                </Text>
            
                <Text style={{ color: colors.text.secondary }}>
                  {getRoleName()}
                </Text>
            
                <Text style={{ color: colors.text.tertiary }}>
                    {profile?.user.email}
                </Text>
              </View>
            </View> */}

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