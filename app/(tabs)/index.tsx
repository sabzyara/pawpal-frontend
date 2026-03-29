import { usePets } from "@/store/petStore";
import { homeScreenStyles } from "@/styles/homeScreenStyles";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Event = {
  id: string;
  title: string;
  time: string;
  petName: string;
};

type Specialist = {
  name: string;
  emoji: string;
  description: string;
};

export default function HomeScreen() {
  const { pets } = usePets();
  const [selectedPet, setSelectedPet] = useState<string | null>(null);

  const specialists: Specialist[] = [
    {
      name: "Ветеринар",
      emoji: "🏥",
      description: "Лечение и профилактика заболеваний",
    },
    { name: "Грумер", emoji: "✂️", description: "Стрижка, уход за шерстью" },
    { name: "Кинолог", emoji: "🐕", description: "Дрессировка собак" },
    { name: "Зоопсихолог", emoji: "🧠", description: "Коррекция поведения" },
    { name: "Фелинолог", emoji: "🐱", description: "Специалист по кошкам" },
    { name: "Петситтер", emoji: "🏠", description: "Няня для питомцев" },
    { name: "Хендлер", emoji: "🏆", description: "Подготовка к выставкам" },
    { name: "Зоодиетолог", emoji: "🥗", description: "Составление рациона" },
  ];

  const allEvents: Event[] = [
    { id: "1", title: "Кормление", time: "08:00", petName: "Бобик" },
    { id: "2", title: "Прогулка", time: "18:00", petName: "Бобик" },
    { id: "3", title: "Прием витаминов", time: "09:00", petName: "Мурка" },
    { id: "4", title: "Игровая сессия", time: "15:00", petName: "Мурка" },
    { id: "5", title: "Осмотр у ветеринара", time: "11:00", petName: "Рекс" },
    { id: "6", title: "Тренировка", time: "16:00", petName: "Рекс" },
  ];

  const displayedEvents = selectedPet
    ? allEvents.filter((event) => event.petName === selectedPet)
    : allEvents;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView style={homeScreenStyles.container}>
        <View style={homeScreenStyles.contentContainer}>
          {/* 👤 Пользователь */}
          <View style={homeScreenStyles.userSection}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={homeScreenStyles.userAvatar}
            />
            <Text style={homeScreenStyles.userName}>Привет, Sabina 👋</Text>
          </View>

          {/* 🐶 Питомцы */}
          <Text style={homeScreenStyles.sectionTitle}>Мои питомцы</Text>

          <FlatList
            horizontal
            data={pets}
            showsHorizontalScrollIndicator={false}
            style={homeScreenStyles.petsList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  setSelectedPet(selectedPet === item ? null : item)
                }
                style={[
                  homeScreenStyles.petCard,
                  selectedPet === item && homeScreenStyles.petCardSelected,
                ]}
              >
                <Text style={homeScreenStyles.petEmoji}>🐾</Text>
                <Text
                  style={[
                    homeScreenStyles.petName,
                    selectedPet === item && homeScreenStyles.petNameSelected,
                  ]}
                >
                  {item}
                </Text>
                {selectedPet === item && (
                  <Text style={homeScreenStyles.selectedBadge}>✓ выбран</Text>
                )}
              </TouchableOpacity>
            )}
          />

          {/* Индикатор фильтрации */}
          {selectedPet && (
            <TouchableOpacity
              onPress={() => setSelectedPet(null)}
              style={homeScreenStyles.resetFilterButton}
            >
              <Text style={homeScreenStyles.resetFilterText}>
                Показать всех питомцев ✕
              </Text>
            </TouchableOpacity>
          )}

          {/* 📅 События */}
          <Text style={homeScreenStyles.sectionTitleWithMargin}>
            {selectedPet ? `Записи для ${selectedPet}` : "Все записи"}
          </Text>

          {displayedEvents.length > 0 ? (
            displayedEvents.map((event) => (
              <View key={event.id} style={homeScreenStyles.eventCard}>
                <View>
                  <Text style={homeScreenStyles.eventTitle}>{event.title}</Text>
                  <Text style={homeScreenStyles.eventTime}>{event.time}</Text>
                  {!selectedPet && (
                    <Text style={homeScreenStyles.eventPetName}>
                      🐕 {event.petName}
                    </Text>
                  )}
                </View>
                <Text style={homeScreenStyles.eventIcon}>📋</Text>
              </View>
            ))
          ) : (
            <View style={homeScreenStyles.emptyState}>
              <Text style={homeScreenStyles.emptyStateText}>
                Нет записей для {selectedPet}
              </Text>
            </View>
          )}

          {/* 🧑‍⚕️ Специалисты */}
          <Text style={homeScreenStyles.sectionTitleWithMargin}>
            Специалисты
          </Text>

          <View style={homeScreenStyles.specialistsGrid}>
            {specialists.map((specialist, index) => (
              <TouchableOpacity
                key={index}
                style={homeScreenStyles.specialistCard}
              >
                <Text style={homeScreenStyles.specialistName}>
                  {specialist.emoji} {specialist.name}
                </Text>
                <Text style={homeScreenStyles.specialistDescription}>
                  {specialist.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Дополнительный отступ снизу */}
          <View style={homeScreenStyles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
