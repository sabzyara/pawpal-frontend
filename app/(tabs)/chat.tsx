import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function ChatScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I am your AI assistant 🐾 How can I help?',
      isUser: false,
    },
  ]);

  const [input, setInput] = useState('');

  const token = useAuthStore(state => state.token);

  const sendMessage = async () => {
  if (!input.trim()) return;

   if (!token) {
    console.log("NO TOKEN");
    return;
  }

  const userMessage: Message = {
    id: Date.now().toString(),
    text: input,
    isUser: true,
  };

  setMessages(prev => [...prev, userMessage]);
  setInput('');

  const loadingMessage: Message = {
    id: "loading",
    text: "AI is typing...",
    isUser: false,
  };

  setMessages(prev => [...prev, loadingMessage]);

  try {
    const response = await fetch(
      "https://pawpal-ai-analytics.onrender.com/ai/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          petId: "1",
          token: token,
        }),
      }
    );
    console.log("STATUS:", response.status);

    const data = await response.json();
    console.log("AI RESPONSE:", data);

    setMessages(prev => prev.filter(m => m.id !== "loading"));

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text:
      typeof data === "string"
    ? data
    : data.response ||
      data.answer ||
      data.result ||
      data.message ||
      data.text ||
      JSON.stringify(data),
      isUser: false,
    };

    setMessages(prev => [...prev, aiMessage]);

  } catch (error) {
    console.log("CHAT ERROR:", error);

    setMessages(prev => prev.filter(m => m.id !== "loading"));

    const errorMessage: Message = {
      id: (Date.now() + 2).toString(),
      text: "Something went wrong 😢",
      isUser: false,
    };

    setMessages(prev => [...prev, errorMessage]);
  }
};


  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={item.isUser ? styles.userText : styles.aiText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/pawpalai.jpg')}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.name}>PawPal AI 🐾</Text>
              <Text style={styles.status}>online</Text>
            </View>
          </View>
        </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          placeholderTextColor="#999"
          style={styles.input}
        />

        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
</SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.card.default,
    },

    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },

    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },

    status: {
      fontSize: 12,
      color: colors.text.secondary,
    },

    message: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
    },

    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary.main,
    },

    aiMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.card.elevated,
    },

    userText: {
      color: colors.text.inverse,
    },

    aiText: {
      color: colors.text.primary,
    },

    // ⌨️ input
    inputContainer: {
      flexDirection: 'row',
      padding: 12,
      borderTopWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
      backgroundColor: colors.card.default,
    },

    input: {
      flex: 1,
      marginRight: 10,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.input.background,
      color: colors.text.primary,
    },

    backButton: {
      marginRight: 10,
      padding: 5,
    },
});