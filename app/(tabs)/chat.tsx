import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I am your AI assistant 🐾 How can I help?',
      isUser: false,
    },
  ]);

  const [input, setInput] = useState('');

  const sendMessage = async () => {
  if (!input.trim()) return;

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
      "https://pawpal-gateway.onrender.com/ai/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          petId: "1",
          token: "",
        }),
      }
    );

    const data = await response.json();

    // ❗ удаляем loading
    setMessages(prev => prev.filter(m => m.id !== "loading"));

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: data.response || data.answer || "No response 😢",
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
      {/* 🔝 HEADER */}
      <View style={styles.header}>
  
  {/* 🔙 КНОПКА НАЗАД */}
  <TouchableOpacity
    onPress={() => router.back()}
    style={styles.backButton}
  >
    <Ionicons name="chevron-back" size={26} color="#6C63FF" />
  </TouchableOpacity>

  {/* 🤖 АВАТАР + ИМЯ */}
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

      {/* 💬 CHAT */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* ⌨️ INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          placeholderTextColor="#999"
          style={styles.input}
        />

        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#6C63FF" />
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // 🔝 HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
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
  },

  status: {
    fontSize: 12,
    color: 'gray',
  },

  // 💬 MESSAGES
  message: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6C63FF',
  },

  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },

  userText: {
    color: '#fff',
  },

  aiText: {
    color: '#000',
  },

  // ⌨️ INPUT
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },

  backButton: {
  marginRight: 10,
  padding: 5,
},

});