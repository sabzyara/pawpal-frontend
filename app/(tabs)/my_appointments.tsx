// app/(tabs)/learn.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const articles = [
  {
    id: '1',
    title: 'How to Choose the Right Pet Food',
    category: 'Nutrition',
    readTime: '5 min read',
    icon: 'coffee',
  },
  {
    id: '2',
    title: 'Understanding Your Pet\'s Behavior',
    category: 'Behavior',
    readTime: '7 min read',
    icon: 'heart',
  },
  {
    id: '3',
    title: 'Essential Vaccination Schedule',
    category: 'Health',
    readTime: '4 min read',
    icon: 'activity',
  },
  {
    id: '4',
    title: 'Pet First Aid Basics',
    category: 'Safety',
    readTime: '8 min read',
    icon: 'shield',
  },
];

export default function LearnScreen() {
  const { colors } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <ScrollView>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText type="title">Learn</ThemedText>
          <View style={{ width: 24 }} />
        </ThemedView>

        <ThemedView style={styles.content}>
          <ThemedText style={styles.subtitle}>Tips, guides & expert advice for pet care</ThemedText>
          
          {articles.map((article) => (
            <TouchableOpacity key={article.id} style={styles.articleCard}>
              <ThemedView style={[styles.card, { backgroundColor: colors.background.primary }]}>
                <View style={styles.cardIcon}>
                  <Feather name={article.icon as any} size={32} color={colors.primary.main} />
                </View>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle}>{article.title}</ThemedText>
                  <ThemedText style={styles.cardMeta}>
                    {article.category} • {article.readTime}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.secondary} />
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    opacity: 0.7,
  },
  articleCard: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    opacity: 0.7,
  },
});