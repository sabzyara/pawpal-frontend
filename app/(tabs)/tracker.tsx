
// app/(tabs)/tracker.tsx
import { CalendarSection } from '@/components/home/Calendar';
import Donut from '@/components/tracker/Donut';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function TrackerScreen() {
  const [tab, setTab] = useState<'nutrition' | 'activity'>('nutrition');
  const [selectedDate, setSelectedDate] = useState(1); 
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={colors.content}>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {tab === 'nutrition' ? 'Nutrition Tracker' : 'Activity Tracker'}
        </Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: tab === 'nutrition'
              ? colors.tracker.primary
              : colors.card.elevated }
          ]}
          onPress={() => setTab('nutrition')}
        >
          <Text style={styles.tabText}>Nutrition</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: tab === 'activity'
              ? colors.tracker.primary
              : colors.card.elevated }
          ]}
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
              style={[
                styles.card,
                { backgroundColor: colors.tracker.primary }
              ]}
              onPress={() => router.push({pathname: '/nutrition-form', 
                params: {
                  mode: 'edit',
                  id: 1,
                  meal: 'Kibble',
                  calories: '120',},})}
            >
              <Text style={[styles.cardTitle, { color: colors.text.inverse }]}>Kibble</Text>
              <View style={[
                styles.innerCard,
                { backgroundColor: colors.tracker.secondary }
              ]}>
                <View style={colors.innerCardTitle}>
                  <View style={colors.innerCardTitle}>
                    <Text>20g</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.tracker.primary }
              ]}
              onPress={() => router.push({pathname: '/nutrition-form' as const, 
                params: {
                  mode: 'edit',
                  id: '1',
                  meal: 'Kibble',
                  calories: '120',},})}
            >
              <Text style={[colors.cardTitle, { color: colors.text.inverse }]}>Kibble</Text>
              <View style={[
                styles.innerCard,
                { backgroundColor: colors.tracker.secondary }
              ]}>
                <View style={colors.innerCardTitle}>
                  <Text>30g</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.tracker.primary }
                ]}
                onPress={() => router.push('/nutrition-form?mode=add' as const)}
            >
              <Text style={colors.addButtonText}>+ Add Nutrition</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.tracker.primary }
              ]}
              onPress={() => router.push({ pathname: '/activity-form' as const,
                params: {
                  mode: 'edit',
                  id: '1',
                  type: 'Run',
                  distance: '5',
                  duration: '20',},})}
            >
              <Text style={[colors.cardTitle, { color: colors.text.inverse }]}>Run</Text>
              <View style={[
                styles.innerCard,
                { backgroundColor: colors.tracker.secondary }
              ]}>
                <View style={colors.innerCardTitle}>
                  <Text>5 min</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.tracker.primary }
              ]}
              onPress={() => router.push({ pathname: '/activity-form' as const,
                params: {
                  mode: 'edit',
                  id: '1',
                  type: 'Run',
                  distance: '5',
                  duration: '20',},})}
            >
              <Text style={[colors.cardTitle, { color: colors.text.inverse }]}>Play</Text>
              <View style={[
                styles.innerCard,
                { backgroundColor: colors.tracker.secondary }
              ]}>
                <View style={colors.innerCardTitle}>
                  <Text>10 min</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.tracker.primary }
              ]}
              onPress={() => router.push('/activity-form?mode=add' as const)}
            >
              <Text style={colors.addButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
          </>
        )}
        
      </ScrollView>
    </SafeAreaView>

  );
};

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
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 20,
    marginHorizontal: 6,
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
  padding: 14,
  borderRadius: 16,
  alignItems: 'center',
},

addButtonText: {
  fontSize: 16,
  fontWeight: '700',
},
});
