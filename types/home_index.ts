// types/home_index.ts

export type ScheduleType = 'vet' | 'walk' | 'medication' | 'grooming';

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: ScheduleType;
  pet: string;
  date: string;        // ✅ изменено с number на string (YYYY-MM-DD)
  done: boolean;
  icon?: string;
}

export interface Day {
  day: string;
  date: number;        // число месяца (для отображения)
  fullDate: string;    // полная дата для сравнения
  month?: string;      // месяц для отображения
}

export interface StatsData {
  totalPets: number;
  completedTasks: number;
  pendingTasks: number;
}

export type GradientColors = [string, string];

export const SCHEDULE_TYPES_CONFIG = {
  vet: { 
    icon: 'medical-bag' as const, 
    route: '/vet'
  },
  walk: { 
    icon: 'dog' as const, 
    route: '/tracker'
  },
  medication: { 
    icon: 'pill' as const, 
    route: '/medication'
  },
  grooming: { 
    icon: 'scissors' as const, 
    route: '/grooming'
  },
} as const;

// ✅ Функция для получения текущей даты в формате YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ Обновленные дни с полными датами
export const DAYS: Day[] = (() => {
  const today = new Date();
  const result: Day[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    
    result.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      fullDate,
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  
  return result;
})();

// ✅ Обновленный INITIAL_SCHEDULE с датами в формате string
export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    title: "Rabies Vaccination",
    time: "10:00 AM",
    type: "vet",
    pet: "Bella",
    date: getTodayDate(),  // сегодня
    done: false,
  },
  {
    id: "2",
    title: "Evening Walk",
    time: "9:00 PM",
    type: "walk",
    pet: "Bobby",
    date: getTodayDate(),  // сегодня
    done: false,
  },
  {
    id: "3",
    title: "Grooming Session",
    time: "2:00 PM",
    type: "grooming",
    pet: "Luna",
    date: getDateString(1),  // завтра
    done: false,
  },
  {
    id: "4",
    title: "Heartworm Medication",
    time: "8:00 AM",
    type: "medication",
    pet: "Max",
    date: getTodayDate(),
    done: false,
  },
  {
    id: "5",
    title: "Vet Checkup",
    time: "11:30 AM",
    type: "vet",
    pet: "Charlie",
    date: getDateString(2),  // послезавтра
    done: false,
  },
];