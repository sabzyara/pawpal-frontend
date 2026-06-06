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

import React, { useState, useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MiniAiCard from '@/components/home/MiniAiCard';
import MiniTrackerCard from '@/components/home/MiniTrackerCard';
// 🔥 ВАЖНО
import { useProfileStore } from '@/store/profileStore';
import { useAuthStore } from '@/store/authStore'; // ✅ ДОБАВЛЕНО

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getNotifications,
} from "@/services/notificationService";

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
  
  const [
  notificationCount,
  setNotificationCount,
] = useState(0);

const [showCalendar, setShowCalendar] =
  useState(true);

  const [showTracker, setShowTracker] =
  useState(true);

const [showAI, setShowAI] =
  useState(true); 


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

  const fetchNotifications =
  async () => {

    try {

      if (!profile?.user?.id)
        return;

      const notifications =
        await getNotifications(
          profile.user.id
        );

      const unread =
        notifications.filter(
          (n: any) => !n.read
        );

      setNotificationCount(
        unread.length
      );

    } catch (e) {

      console.log(
        "NOTIFICATION ERROR:",
        e
      );
    }
  };

  

 const loadHomeSettings = async () => {
  setShowCalendar(
    (
      await AsyncStorage.getItem(
        'showCalendar'
      )
    ) !== 'false'
  );

  setShowTracker(
    (
      await AsyncStorage.getItem(
        'showTracker'
      )
    ) !== 'false'
  );

  setShowAI(
    (
      await AsyncStorage.getItem(
        'showAI'
      )
    ) !== 'false'
  );

};


  // ✅ ИЗМЕНЕНО: убран authUser из profileStore, добавлен user из authStore
  const { profile, fetchProfile } = useProfileStore();
  const user = useAuthStore((state) => state.user);

  // 🔄 ОБНОВЛЕНИЕ
useFocusEffect(
  useCallback(() => {
    fetchPets();

    // ✅ ИЗМЕНЕНО: передаем user вместо authUser
    if (user) {
      fetchProfile(user);
    }

    fetchNotifications();

    loadHomeSettings();
    // ✅ ИЗМЕНЕНО: зависимость от user вместо authUser
  }, [profile, user])
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
  const handleNotificationPress = () => router.push("/notifications");

  const handleTaskPress = (item: ScheduleItem) => {
    const route = SCHEDULE_TYPES_CONFIG[item.type].route;
    router.push(route as any);
  };

  const [analysisData, setAnalysisData] =
  useState<any[]>([]);

  const [trackerData, setTrackerData] =
  useState<any[]>([]);

const loadAnalysis = async () => {
  try {
    const results = await Promise.all(
      pets.map(async (pet) => {
        const res = await api.get(
          `/pet-management/api/recommendations/${pet.id}`
        );

        return {
          petId: pet.id,
          petName: pet.name,
          avatarUrl: pet.avatarUrl,
          ...res.data,
        };
      })
    );

    setAnalysisData(results);

  } catch (e) {
    console.log(e);
  }
};

const loadTracker = async () => {
  try {
    const results = await Promise.all(
      pets.map(async (pet) => {
        const [nutritionRes, activityRes] =
          await Promise.all([
            api.get(
              `/pet-management/api/nutrition/pet/${pet.id}`
            ),
            api.get(
              `/pet-management/api/activities/pet/${pet.id}`
            ),
          ]);

        const nutritionForDay =
          nutritionRes.data.filter(
            (n: any) =>
              n.date?.slice(0, 10) ===
              selectedDate
          );

        const activityForDay =
          activityRes.data.filter(
            (a: any) =>
              a.date?.slice(0, 10) ===
              selectedDate
          );

        const calories =
          nutritionForDay.reduce(
            (
              sum: number,
              item: any
            ) => {
              const match =
                item.summary?.match(
                  /(\d+(\.\d+)?)/
                );

              return (
                sum +
                (match
                  ? parseFloat(
                      match[0]
                    )
                  : 0)
              );
            },
            0
          );

        const activity =
          activityForDay.length * 10;

        return {
          petId: pet.id,
          petName: pet.name,
          avatarUrl:
            pet.avatarUrl,
          calories,
          activity,
        };
      })
    );

    setTrackerData(results);
  } catch (e) {
    console.log(
      'TRACKER ERROR:',
      e
    );
  }
};


useEffect(() => {
  if (pets.length > 0) {
    loadTracker();
  }
}, [
  pets,
  selectedDate,
]);

useEffect(() => {
  if (pets.length > 0) {
    loadAnalysis();
  }
}, [pets]);

  

  return (
    <SafeAreaView style={styles.safe}>
<HomeHeader
  greeting={greeting}
  userName={getDisplayName()}
  avatarUrl={
    profile?.petOwner?.avatarUrl ||
    profile?.veterinarian?.avatarUrl ||
    profile?.serviceProvider?.avatarUrl ||
    null
  }
  notificationCount={
  notificationCount
}
  onNotificationPress={handleNotificationPress}
/>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              onRefresh();
              fetchPets();
              // ✅ ИЗМЕНЕНО: передаем user вместо authUser
              if (user) {
                fetchProfile(user);
              }
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

        {showCalendar && (
        <CalendarSection
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      )}

         {showTracker && (
         <MiniTrackerCard
          pets={trackerData}
          onPress={() =>
            router.push('/tracker')
          }
        />
        )}

        {showAI && (
          <MiniAiCard
            pets={analysisData}
            onPress={() =>
              router.push('/analysis')
            }
          />
        )}

        </View>
      </ScrollView>
      <FloatingChatButton />
    </SafeAreaView>
  );
}