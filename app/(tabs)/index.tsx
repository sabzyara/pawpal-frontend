import { usePets } from "@/store/petStore";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { styles as s } from "@/styles/homeScreenStyles";

// Types
interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: "vet" | "walk" | "medication" | "grooming";
  pet: string;
  date: number;
  done: boolean;
  icon?: string;
}

// Mock data
const days = [
  { day: "Mon", date: 13, fullDate: "May 13" },
  { day: "Tue", date: 14, fullDate: "May 14" },
  { day: "Wed", date: 15, fullDate: "May 15" },
  { day: "Thu", date: 16, fullDate: "May 16" },
  { day: "Fri", date: 17, fullDate: "May 17" },
  { day: "Sat", date: 18, fullDate: "May 18" },
  { day: "Sun", date: 19, fullDate: "May 19" },
];

const initialSchedule: ScheduleItem[] = [
  {
    id: "1",
    title: "Rabies Vaccination",
    time: "10:00 AM",
    type: "vet",
    pet: "Bella",
    date: 15,
    done: false,
    icon: "medical-bag",
  },
  {
    id: "2",
    title: "Evening Walk",
    time: "9:00 PM",
    type: "walk",
    pet: "Bobby",
    date: 15,
    done: false,
    icon: "dog",
  },
  {
    id: "3",
    title: "Grooming Session",
    time: "2:00 PM",
    type: "grooming",
    pet: "Luna",
    date: 16,
    done: false,
    icon: "scissors",
  },
];

export default function HomeScreen() {
  const { pets } = usePets();
  const [selectedDate, setSelectedDate] = useState(15);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");

  // Dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Notification setup
  useEffect(() => {
    if (Platform.OS === "web") return;
    
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      
      schedule.forEach(async (task) => {
        if (!task.done) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: task.title,
              body: `Time: ${task.time} - ${task.pet}`,
              data: { id: task.id, type: task.type },
            },
            trigger: null,
          });
        }
      });
    };
    
    setupNotifications();
  }, [schedule]);

  const toggleDone = useCallback((id: string) => {
    setSchedule((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data fetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const filteredSchedule = schedule.filter((s) => s.date === selectedDate);
  const upcomingTasks = schedule.filter((s) => !s.done && s.date >= selectedDate).length;
  const completedTasks = schedule.filter((s) => s.done).length;

  const getTypeColor = (type: ScheduleItem["type"]): [string, string] => {
    const colors = {
      vet: ["#F4B183", "#E8925C"] as [string, string],
      walk: ["#6B8AFD", "#4B6BD6"] as [string, string],
      medication: ["#FF9A9E", "#FECFEF"] as [string, string],
      grooming: ["#A8E6CF", "#7ECBA1"] as [string, string],
    };
    return colors[type] || colors.walk;
  };

  const getTypeIcon = (type: ScheduleItem["type"]): string => {
    const icons = {
      vet: "medical-bag",
      walk: "dog",
      medication: "pill",
      grooming: "scissors",
    };
    return icons[type];
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={s.container}>
          {/* Header Section */}
          <View style={s.headerSection}>
            <View>
              <Text style={s.greeting}>{greeting} 👋</Text>
              <Text style={s.userName}>Pet Parent</Text>
            </View>
            <TouchableOpacity style={s.notificationIcon}>
              <Feather name="bell" size={24} color="#333" />
              {upcomingTasks > 0 && (
                <View style={s.notificationBadge}>
                  <Text style={s.badgeText}>{upcomingTasks}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={s.statsContainer}>
            <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={s.statCard}>
              <MaterialCommunityIcons name="paw" size={28} color="#FFF" />
              <Text style={s.statNumber}>{pets.length}</Text>
              <Text style={s.statLabel}>Total Pets</Text>
            </LinearGradient>
            
            <LinearGradient colors={["#4ECDC4", "#6BE4DC"]} style={s.statCard}>
              <Feather name="check-circle" size={28} color="#FFF" />
              <Text style={s.statNumber}>{completedTasks}</Text>
              <Text style={s.statLabel}>Completed</Text>
            </LinearGradient>
            
            <LinearGradient colors={["#FFE66D", "#FFED9E"]} style={s.statCard}>
              <Feather name="clock" size={28} color="#FFF" />
              <Text style={s.statNumber}>{upcomingTasks}</Text>
              <Text style={s.statLabel}>Pending</Text>
            </LinearGradient>
          </View>

          {/* Calendar Section */}
          <View style={s.calendarSection}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Calendar</Text>
              <TouchableOpacity>
                <Text style={s.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.calendarRow}>
                {days.map((d) => (
                  <TouchableOpacity
                    key={d.date}
                    onPress={() => setSelectedDate(d.date)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        selectedDate === d.date
                          ? (["#FF6B6B", "#FF8E8E"] as [string, string])
                          : (["#F8F9FA", "#F8F9FA"] as [string, string])
                      }
                      style={[
                        s.dayCard,
                        selectedDate === d.date && s.dayCardActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.dayText,
                          selectedDate === d.date && s.dayTextActive,
                        ]}
                      >
                        {d.day}
                      </Text>
                      <Text
                        style={[
                          s.dateText,
                          selectedDate === d.date && s.dateTextActive,
                        ]}
                      >
                        {d.date}
                      </Text>
                      {selectedDate === d.date && (
                        <View style={s.activeIndicator} />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Pets Section */}
          <View style={s.petsSection}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>My Pets</Text>
              <TouchableOpacity onPress={() => router.push("/add")}>
                <Feather name="plus-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={pets}
              keyExtractor={(item, i) => i.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => router.push("/pet")}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#FFFFFF", "#F8F9FA"]}
                    style={s.petCard}
                  >
                    <View style={s.petImageContainer}>
                      <Image
                        source={{
                          uri:
                            index % 2 === 0
                              ? "https://images.unsplash.com/photo-1552053831-7158f46f0c79"
                              : "https://images.unsplash.com/photo-1583511655826-05700d52f4d9",
                        }}
                        style={s.petImage}
                      />
                    </View>
                    <Text style={s.petName}>{item}</Text>
                    <View style={s.petStatus}>
                      <View style={s.activeDot} />
                      <Text style={s.petStatusText}>Active</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Schedule Section */}
          <View style={s.scheduleSection}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Today's Schedule</Text>
              <TouchableOpacity>
                <Text style={s.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {filteredSchedule.length === 0 ? (
              <View style={s.emptyState}>
                <Feather name="calendar" size={48} color="#DDD" />
                <Text style={s.emptyStateText}>No tasks scheduled</Text>
                <TouchableOpacity style={s.addTaskButton}>
                  <Text style={s.addTaskText}>+ Add Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredSchedule.map((item) => {
                const isCompleted = item.done;
                const gradientColors = getTypeColor(item.type);
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (item.type === "vet") router.push("/vet");
                      if (item.type === "walk") router.push("/tracker");
                    }}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={gradientColors}
                      style={[s.scheduleCard, isCompleted && s.completedCard]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <View style={s.scheduleLeft}>
                        <TouchableOpacity
                          onPress={() => toggleDone(item.id)}
                          style={[
                            s.checkbox,
                            isCompleted && s.checkboxActive,
                          ]}
                        >
                          {isCompleted && (
                            <Feather name="check" size={16} color="#FFF" />
                          )}
                        </TouchableOpacity>
                        
                        <View style={s.scheduleIcon}>
                          <MaterialCommunityIcons
                            name={item.icon as any || getTypeIcon(item.type) as any}
                            size={24}
                            color="#FFF"
                          />
                        </View>
                        
                        <View style={s.scheduleInfo}>
                          <Text style={[s.scheduleTitle, isCompleted && s.completedText]}>
                            {item.title}
                          </Text>
                          <Text style={s.scheduleTime}>
                            <Feather name="clock" size={12} color="#FFF" /> {item.time}
                          </Text>
                          <Text style={s.schedulePet}>
                            <MaterialCommunityIcons name="paw" size={12} color="#FFF" />{" "}
                            {item.pet}
                          </Text>
                        </View>
                      </View>
                      
                      <Feather
                        name="chevron-right"
                        size={20}
                        color="#FFF"
                        style={s.chevron}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Learn Section */}
          <TouchableOpacity onPress={() => router.push("/learn")} activeOpacity={0.9}>
            <LinearGradient
              colors={["#667EEA", "#764BA2"]}
              style={s.learnCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={s.learnContent}>
                <View>
                  <Text style={s.learnTitle}>Learn about pets 🐾</Text>
                  <Text style={s.learnSubtitle}>
                    Tips, guides & expert advice
                  </Text>
                </View>
                <Feather name="arrow-right" size={24} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}