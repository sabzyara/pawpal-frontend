import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    title: "Understanding Your Pet's Behavior",
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
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <ThemedText style={styles.title}>Learn</ThemedText>

          <View style={{ width: 24 }} />
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <ThemedText style={styles.subtitle}>
            Tips, guides & expert advice for pet care
          </ThemedText>

          {articles.map((article) => (
            <TouchableOpacity key={article.id} style={styles.articleCard}>
              
              <View style={styles.card}>
                
                {/* ICON */}
                <View style={styles.iconWrapper}>
                  <Feather
                    name={article.icon as any}
                    size={22}
                    color={colors.primary.main}
                  />
                </View>

                {/* TEXT */}
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle}>
                    {article.title}
                  </ThemedText>

                  <ThemedText style={styles.cardMeta}>
                    {article.category} • {article.readTime}
                  </ThemedText>
                </View>

                {/* ARROW */}
                <Feather
                  name="chevron-right"
                  size={20}
                  color={colors.text.tertiary}
                />
              </View>

            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
    },

    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },

    content: {
      paddingHorizontal: 20,
    },

    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 24,
    },

    articleCard: {
      marginBottom: 12,
    },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,

      backgroundColor: colors.card.default,
      borderWidth: 1,
      borderColor: colors.border.light,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,

      backgroundColor: colors.background.secondary,
    },

    cardContent: {
      flex: 1,
    },

    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },

    cardMeta: {
      fontSize: 12,
      color: colors.text.secondary,
    },
  });