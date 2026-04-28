import { NotificationItem } from '@/components/notification-item';
import { useTheme } from '@/hooks/useTheme';
import { Notification } from '@/types/notification';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_DATA: Notification[] = [
  {
    id: 1,
    title: 'Feeding Time 🐶',
    message: 'Time to feed your pet',
    type: 'FEEDING_REMINDER',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Walk Reminder 🚶‍♂️',
    message: 'Go for a walk!',
    type: 'WALK_REMINDER',
    read: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Vet Visit 💊',
    message: 'Don’t forget vaccination',
    type: 'MEDICAL_REMINDER',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();

  const [tab, setTab] = useState<'unread' | 'read'>('unread');
  const [data, setData] = useState(MOCK_DATA);

  const handleMarkRead = (id: number) => {
    setData((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const filtered = data.filter((n) =>
    tab === 'unread' ? !n.read : n.read
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      
      {/* 🔥 TITLE */}
      <Text style={[styles.header, { color: colors.text.primary }]}>
        Notifications
      </Text>

      {/* 🔥 TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'unread' && { backgroundColor: colors.primary.main },
          ]}
          onPress={() => setTab('unread')}
        >
          <Text style={styles.tabText}>
            Unread {data.filter((n) => !n.read).length}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'read' && { backgroundColor: colors.primary.main },
          ]}
          onPress={() => setTab('read')}
        >
          <Text style={styles.tabText}>
            Read {data.filter((n) => n.read).length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem item={item} onMarkRead={handleMarkRead} />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 10,
  },

  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },

  tabText: {
    color: 'white',
    fontWeight: '600',
  },
});