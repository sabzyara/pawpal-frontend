// screens/home/components/ScheduleSection.tsx
import { useTheme } from '@/hooks/useTheme';
import { createHomeStyles } from '@/styles/homeStyles';
import { ScheduleItem } from '@/types/home_index';
import { getScheduleColors } from '@/utils/getScheduleColors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const getIconName = (type: ScheduleItem['type']): MaterialIconName => {
  const iconMap: Record<ScheduleItem['type'], MaterialIconName> = {
    vet: 'medical-bag',
    walk: 'dog',
    medication: 'pill',
    grooming: 'scissors-cutting',  // ✅ исправлено на существующую иконку
  };
  return iconMap[type];
};

// ✅ Функция для форматирования даты
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  } catch {
    return dateString;
  }
};

interface ScheduleSectionProps {
  schedule: ScheduleItem[];
  onTaskPress: (item: ScheduleItem) => void;
  onToggleDone: (id: string) => void;
  onViewAllPress?: () => void;
  onAddTaskPress?: () => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  onTaskPress,
  onToggleDone,
  onViewAllPress,
  onAddTaskPress,
}) => {
  const { colors } = useTheme();
  const styles = createHomeStyles(colors);

  // ✅ Пустое состояние с кнопкой "Add Task"
  if (schedule.length === 0) {
    return (
      <View style={styles.scheduleSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          {onViewAllPress && (
            <TouchableOpacity onPress={onViewAllPress}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.emptyState}>
          <Feather name="calendar" size={48} color={colors.border.medium} />
          <Text style={styles.emptyStateText}>No tasks scheduled</Text>
          {onAddTaskPress && (  // ✅ проверка наличия обработчика
            <TouchableOpacity style={styles.addTaskButton} onPress={onAddTaskPress}>
              <Text style={styles.addTaskText}>+ Add Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.scheduleSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {schedule.map((item) => {
        const isCompleted = item.done;
        const iconName = getIconName(item.type);
        const formattedDate = formatDate(item.date);  // ✅ форматируем дату
        
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onTaskPress(item)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={getScheduleColors(item.type, colors)}
              style={[styles.scheduleCard, isCompleted && styles.completedCard]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.scheduleLeft}>
                <TouchableOpacity
                  onPress={() => onToggleDone(item.id)}
                  style={[styles.checkbox, isCompleted && styles.checkboxActive]}
                >
                  {isCompleted && <Feather name="check" size={16} color="#FFF" />}
                </TouchableOpacity>

                <View style={styles.scheduleIcon}>
                  <MaterialCommunityIcons
                    name={iconName}
                    size={24}
                    color="#FFF"
                  />
                </View>

                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleTitle, isCompleted && styles.completedText]}>
                    {item.title}
                  </Text>
                  
                  {/* ✅ Добавлено отображение даты */}
                  <Text style={styles.scheduleDate}>
                    <Feather name="calendar" size={12} color="#FFF" /> {formattedDate}
                  </Text>
                  
                  <Text style={styles.scheduleTime}>
                    <Feather name="clock" size={12} color="#FFF" /> {item.time}
                  </Text>
                  
                  <Text style={styles.schedulePet}>
                    <MaterialCommunityIcons name="paw" size={12} color="#FFF" /> {item.pet}
                  </Text>
                </View>
              </View>

              <Feather name="chevron-right" size={20} color="#FFF" style={styles.chevron} />
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};