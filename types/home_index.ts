// screens/home/types/index.ts
export type ScheduleType = 'vet' | 'walk' | 'medication' | 'grooming';

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: ScheduleType;
  pet: string;
  date: number;
  done: boolean;
  icon?: string;
}

export interface Day {
  day: string;
  date: number;
  fullDate: string;
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
    gradient: ['#F4B183', '#E8925C'] as GradientColors,
    route: '/vet'
  },
  walk: { 
    icon: 'dog' as const, 
    gradient: ['#6B8AFD', '#4B6BD6'] as GradientColors,
    route: '/tracker'
  },
  medication: { 
    icon: 'pill' as const, 
    gradient: ['#FF9A9E', '#FECFEF'] as GradientColors,
    route: '/medication'
  },
  grooming: { 
    icon: 'scissors' as const, 
    gradient: ['#A8E6CF', '#7ECBA1'] as GradientColors,
    route: '/grooming'
  },
} as const;

export const DAYS: Day[] = [
  { day: "Mon", date: 13, fullDate: "May 13" },
  { day: "Tue", date: 14, fullDate: "May 14" },
  { day: "Wed", date: 15, fullDate: "May 15" },
  { day: "Thu", date: 16, fullDate: "May 16" },
  { day: "Fri", date: 17, fullDate: "May 17" },
  { day: "Sat", date: 18, fullDate: "May 18" },
  { day: "Sun", date: 19, fullDate: "May 19" },
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    title: "Rabies Vaccination",
    time: "10:00 AM",
    type: "vet",
    pet: "Bella",
    date: 15,
    done: false,
  },
  {
    id: "2",
    title: "Evening Walk",
    time: "9:00 PM",
    type: "walk",
    pet: "Bobby",
    date: 15,
    done: false,
  },
  {
    id: "3",
    title: "Grooming Session",
    time: "2:00 PM",
    type: "grooming",
    pet: "Luna",
    date: 16,
    done: false,
  },
];