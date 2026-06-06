import { useState, useCallback } from 'react';
import { ScheduleItem } from '@/types/home_index';
import { INITIAL_SCHEDULE } from '@/types/home_index';

export const useSchedule = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  
  // ✅ Изменено: теперь string в формате YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]  // например "2024-01-15"
  );
  
  const [refreshing, setRefreshing] = useState(false);

  const toggleDone = useCallback((id: string) => {
    setSchedule(prev =>
      prev.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  // ✅ Фильтрация по строковой дате
  const filteredSchedule = schedule.filter(item => item.date === selectedDate);
  
  // ✅ Подсчет предстоящих задач (сравнение строковых дат)
  const upcomingTasks = schedule.filter(item => !item.done && item.date >= selectedDate).length;
  
  const completedTasks = schedule.filter(item => item.done).length;

  return {
    schedule,
    selectedDate,
    refreshing,
    filteredSchedule,
    upcomingTasks,
    completedTasks,
    setSelectedDate,
    toggleDone,
    onRefresh,
  };
};