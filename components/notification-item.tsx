import { useTheme } from '@/hooks/useTheme';
import { Notification } from '@/types/notification';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface Props {
  item: Notification;
  onMarkRead: (id: number) => void;
}

export const NotificationItem = ({ item, onMarkRead }: Props) => {
  const { colors } = useTheme();

  const renderRightActions = () => (
    <View style={styles.swipe}>
      <Text style={styles.swipeText}>✓</Text>
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => onMarkRead(item.id)}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card.elevated,
            borderColor: item.read
              ? colors.border.light
              : colors.primary.main,
          },
        ]}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: item.read
                ? colors.icon.inactive
                : colors.primary.main,
            },
          ]}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text.primary,
                fontWeight: item.read ? '400' : '700',
              },
            ]}
          >
            {item.title}
          </Text>

          <Text style={[styles.message, { color: colors.text.secondary }]}>
            {item.message}
          </Text>
        </View>

        <View style={styles.time}>
          <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={{ color: colors.primary.main, fontSize: 14 }}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    marginTop: 4,
  },
  time: {
    alignItems: 'flex-end',
  },
  swipe: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 20,
    marginBottom: 14,
  },
  swipeText: {
    color: 'white',
    fontSize: 18,
  },
});