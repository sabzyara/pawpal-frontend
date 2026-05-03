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
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          {tab === 'nutrition' ? 'Nutrition Tracker' : 'Activity Tracker'}
        </Text>

      <View style={[
          styles.tabsContainer,
          { backgroundColor: colors.card.elevated },
        ]}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: tab === 'nutrition'
              ? colors.primary.main
              : colors.card.elevated }
          ]}
          onPress={() => setTab('nutrition')}
        >
          <Text style={[styles.tabText,
            { color: tab === 'nutrition' ? 'white' : colors.text.secondary },
          ]}>Nutrition</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: tab === 'activity'
              ? colors.primary.main
              : colors.card.elevated }
          ]}
          onPress={() => setTab('activity')}
        >
          <Text style={[styles.tabText,
            { color: tab === 'activity' ? 'white' : colors.text.secondary },
          ]}>Activity</Text>
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
                styles.simpleCard,
                { backgroundColor: colors.card.elevated }
              ]}
              onPress={() =>
                router.push('/nutrition-form?mode=edit&meal=Kibble&calories=120')
              }
            >
              <Text style={[styles.cardLeft, { color: colors.text.primary }]}>
                Kibble
              </Text>

              <Text style={[styles.cardRight, { color: colors.text.secondary }]}>
                120 kcal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.simpleCard,
                { backgroundColor: colors.card.elevated }
              ]}
              onPress={() =>
                router.push('/nutrition-form?mode=edit&meal=Kibble&calories=150')
              }
            >
              <Text style={[styles.cardLeft, { color: colors.text.primary }]}>
                Kibble
              </Text>

              <Text style={[styles.cardRight, { color: colors.text.secondary }]}>
                150 kcal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.tracker.primary }
                ]}
                onPress={() => router.push('/nutrition-form?mode=add' as const)}
            >
              <Text style={styles.addButtonText}>+ Add Nutrition</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.simpleCard,
                { backgroundColor: colors.card.elevated }
              ]}
              onPress={() =>
                router.push('/activity-form?mode=edit&type=Run&duration=5')
              }
            >
              <Text style={[styles.cardLeft, { color: colors.text.primary }]}>
                Run
              </Text>

              <Text style={[styles.cardRight, { color: colors.text.secondary }]}>
                5 min
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.simpleCard,
                { backgroundColor: colors.card.elevated }
              ]}
              onPress={() =>
                router.push('/activity-form?mode=edit&type=Play&duration=5')
              }
            >
              <Text style={[styles.cardLeft, { color: colors.text.primary }]}>
                Run
              </Text>

              <Text style={[styles.cardRight, { color: colors.text.secondary }]}>
                5 min
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.tracker.primary }
              ]}
              onPress={() => router.push('/activity-form?mode=add' as const)}
            >
              <Text style={styles.addButtonText}>+ Add Activity</Text>
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

  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  tab: {
    flex: 1, 
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },

  tabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
    
  simpleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  cardLeft: {
    fontSize: 16,
    fontWeight: '600',
  },

  cardRight: {
    fontSize: 14,
    opacity: 0.7,
  },

  addButton: {
  padding: 14,
  borderRadius: 16,
  alignItems: 'center',
},

addButtonText: {
  fontSize: 16,
  fontWeight: '700',
  color: "#FFFF",
},
});
