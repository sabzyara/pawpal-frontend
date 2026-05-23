import { NotificationItem } from '@/components/notification-item';
import { useTheme } from '@/hooks/useTheme';
import { Notification } from '@/types/notification';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from "expo-router";
import { useProfileStore }
from "@/store/profileStore";
import {
  getNotifications,
  markNotificationRead,
} from "@/services/notificationService";

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { profile } =
  useProfileStore();
  const [tab, setTab] = useState<'unread' | 'read'>('unread');
  const [data, setData] = useState<Notification[]>([]);

 useEffect(() => {

  if (profile?.user?.id) {
    loadNotifications();
  }

}, [profile]);

  const loadNotifications = async () => {
    try {
      if (!profile?.user?.id)
  return;

const res =
  await getNotifications(
    profile.user.id
  );

      setData(res);
    } catch (e) {
      console.log(e);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);

      setData((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true }
            : n
        )
      );
    } catch (e) {
      console.log(e);
    }
  };

  const filtered = data.filter((n) =>
    tab === 'unread' ? !n.read : n.read
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
        },
      ]}
    >
      <Text
        style={[
          styles.header,
          {
            color: colors.text.primary,
          },
        ]}
      >
        Notifications
      </Text>

      <View
        style={[
          styles.tabsContainer,
          {
            backgroundColor: colors.card.elevated,
          },
        ]}
      >
        {/* UNREAD */}
        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'unread' && {
              backgroundColor: colors.primary.main,
            },
          ]}
          onPress={() => setTab('unread')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  tab === 'unread'
                    ? 'white'
                    : colors.text.secondary,
              },
            ]}
          >
            Unread
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  tab === 'unread'
                    ? 'rgba(255,255,255,0.2)'
                    : colors.border.medium,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {data.filter((n) => !n.read).length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* READ */}
        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'read' && {
              backgroundColor: colors.primary.main,
            },
          ]}
          onPress={() => setTab('read')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  tab === 'read'
                    ? 'white'
                    : colors.text.secondary,
              },
            ]}
          >
            Read
          </Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  tab === 'read'
                    ? 'rgba(255,255,255,0.2)'
                    : colors.border.medium,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {data.filter((n) => n.read).length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onMarkRead={handleMarkRead}
          />
        )}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      />

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary.main,
          },
        ]}
        onPress={() => router.push("/add-reminder")}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>
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

  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },

  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },

  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  addButton: {
    position: "absolute",
    bottom: 30,
    right: 24,

    width: 64,
    height: 64,
    borderRadius: 32,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 6,
  },

  addButtonText: {
    color: "white",
    fontSize: 34,
    fontWeight: "300",
  },
});