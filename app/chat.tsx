
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const token = useAuthStore((s) => s.token);

  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hi! I am your AI assistant 🐾", isUser: false },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  // 🐾 загрузка петов
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/pet-management/api/pets");
        const data = res.data.map((p: any) => p.pet ?? p);

        setPets(data);

        if (data.length > 0) {
          setSelectedPet(data[0].id);
        }
      } catch (e) {
        console.log("PET LOAD ERROR", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 💬 отправка
  const sendMessage = async () => {
    if (!input.trim() || !selectedPet || !token) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(
        "https://pawpal-ai-analytics.onrender.com/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMsg.text,
            petId: String(selectedPet), // 🔥 ВАЖНО
            token: token,               // 🔥 ВАЖНО
          }),
        }
      );

      const data = await res.json();

      const aiMsg: Message = {
        id: Date.now().toString(),
        text: data.response || JSON.stringify(data),
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.log("CHAT ERROR", e);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.msg,
        item.isUser ? styles.userMsg : styles.aiMsg,
      ]}
    >
      <Text style={item.isUser ? styles.userText : styles.aiText}>
        {item.text}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const selectedPetData = pets.find((p) => p.id === selectedPet);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>PawPal AI 🐾</Text>
        </View>

        {/* CHAT */}
        <FlatList
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          
          {/* 🐾 PET ICON */}
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Image
              source={{
                uri:
                  selectedPetData?.avatarUrl ||
                  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
              }}
              style={styles.petIcon}
            />
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your pet..."
            placeholderTextColor="#888"
            style={styles.input}
          />

          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={22} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* 🐾 MODAL PICKER */}
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Select Pet</Text>

              <FlatList
                horizontal
                data={pets}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPet(item.id);
                      setShowPicker(false);
                    }}
                    style={styles.petItem}
                  >
                    <Image
                      source={{ uri: item.avatarUrl }}
                      style={[
                        styles.petAvatar,
                        selectedPet === item.id && styles.activePet,
                      ]}
                    />
                    <Text style={{ color: colors.text.primary }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
    },

    msg: {
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
      maxWidth: "75%",
    },

    userMsg: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary.main,
    },

    aiMsg: {
      alignSelf: "flex-start",
      backgroundColor: colors.card.elevated,
    },

    userText: { color: "#fff" },
    aiText: { color: colors.text.primary },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderTopWidth: 1,
      borderColor: colors.border.light,
    },

    input: {
      flex: 1,
      marginHorizontal: 10,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.input.background,
      color: colors.text.primary,
    },

    petIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },

    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },

    modal: {
      backgroundColor: colors.background.secondary,
      padding: 16,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },

    modalTitle: {
      color: colors.text.primary,
      fontSize: 16,
      marginBottom: 10,
    },

    petItem: {
      alignItems: "center",
      marginRight: 16,
    },

    petAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },

    activePet: {
      borderWidth: 3,
      borderColor: colors.primary.main,
    },
  });

