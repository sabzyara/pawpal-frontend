// screens/home/hooks/useNotifications.ts
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ScheduleItem } from '@/types/home_index';

export const useNotifications = (schedule: ScheduleItem[]) => {
  useEffect(() => {
    if (Platform.OS === "web") return;
    
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      
      const pendingTasks = schedule.filter(task => !task.done);
      
      for (const task of pendingTasks) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: task.title,
            body: `Time: ${task.time} - ${task.pet}`,
            data: { id: task.id, type: task.type },
          },
          trigger: null,
        });
      }
    };
    
    setupNotifications();
  }, [schedule]);
};