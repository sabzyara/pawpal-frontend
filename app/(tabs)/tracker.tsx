
// app/(tabs)/tracker.tsx
// import { TrackerColors } from '@/constants/theme';
import { CalendarSection } from '@/components/home/Calendar';
import Donut from '@/components/tracker/Donut';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TrackerColors = {
  primary: '#FF6B6B',
  secondary: '#FFC7C7',
  light: '#FF8E8E',
};


export default function TrackerScreen() {
  const [tab, setTab] = useState<'nutrition' | 'activity'>('nutrition');
  const [selectedDate, setSelectedDate] = useState(1); 
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {tab === 'nutrition' ? 'Nutrition Tracker' : 'Activity Tracker'}
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'nutrition' && styles.activeTab]}
            onPress={() => setTab('nutrition')}
          >
            <Text style={styles.tabText}>Nutrition</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tab === 'activity' && styles.activeTab]}
            onPress={() => setTab('activity')}
          >
            <Text style={styles.tabText}>Activity</Text>
          </TouchableOpacity>
        </View>

        <CalendarSection
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <View style={{ marginBottom: 20 }}>
          <Donut
            value={tab === 'nutrition' ? 1250 : 75}
            max={tab === 'nutrition' ? 1860 : 100}
          />
        </View>

        {tab === 'nutrition' ? (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({pathname: '/nutrition-form', 
                params: {
                  mode: 'edit',
                  id: 1,
                  meal: 'Kibble',
                  calories: '120',},})}
            >
              <Text style={styles.cardTitle}>Kibble</Text>
              <View style={styles.innerCard}>
                <View style={styles.innerCardTitle}>
                  <View style={styles.innerCardTitle}>
                    <Text>20g</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({pathname: '/nutrition-form' as const, 
                params: {
                  mode: 'edit',
                  id: '1',
                  meal: 'Kibble',
                  calories: '120',},})}
            >
              <Text style={styles.cardTitle}>Kibble</Text>
              <View style={styles.innerCard}>
                <View style={styles.innerCardTitle}>
                  <Text>30g</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/nutrition-form?mode=add' as const)}
            >
              <Text style={styles.addButtonText}>+ Add Nutrition</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/activity-form' as const,
                params: {
                  mode: 'edit',
                  id: '1',
                  type: 'Run',
                  distance: '5',
                  duration: '20',},})}
            >
              <Text style={styles.cardTitle}>Run</Text>
              <View style={styles.innerCard}>
                <View style={styles.innerCardTitle}>
                  <Text>5 min</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/activity-form' as const,
                params: {
                  mode: 'edit',
                  id: '1',
                  type: 'Run',
                  distance: '5',
                  duration: '20',},})}
            >
              <Text style={styles.cardTitle}>Play</Text>
              <View style={styles.innerCard}>
                <View style={styles.innerCardTitle}>
                  <Text>10 min</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/activity-form?mode=add' as const)}
            >
              <Text style={styles.addButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
          </>
        )}
        
      </ScrollView>
    </SafeAreaView>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingTop: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  tab: {
    // backgroundColor: TrackerColors.light,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginHorizontal: 6,
  },

  activeTab: {
    backgroundColor: TrackerColors.primary,
  },

  tabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },

  mainValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },

  subValue: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },

  card: {
    backgroundColor: TrackerColors.primary,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#fff',
  },

  innerCard: {
    backgroundColor: TrackerColors.secondary,
    padding: 10,
    borderRadius: 15,
  },

    innerCardTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 0,
    color: '#fff',
  },

  addButton: {
  backgroundColor: '#FF6B6B',
  padding: 14,
  borderRadius: 16,
  alignItems: 'center',
},

addButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

});
