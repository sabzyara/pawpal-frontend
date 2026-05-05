import { create } from 'zustand';
import { Veterinarian, Review, Availability } from '@/types/veterinarian';

interface State {
  vet: Veterinarian | null;
  reviews: Review[];
  availability: Availability | null;
  isLoading: boolean;

  loadAll: (id: number) => Promise<void>;
}

export const useVeterinarianStore = create<State>((set) => ({
  vet: null,
  reviews: [],
  availability: null,
  isLoading: false,

  loadAll: async (id) => {
    set({ isLoading: true });

    // МОК
    await new Promise((r) => setTimeout(r, 500));

    set({
      vet: {
        id,
        firstName: 'Аружан',
        lastName: 'Бекова',
        experienceYears: 6,
        rating: 4.8,
        patientsCount: 540,
        about: 'Опытный ветеринар...',
        avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
      reviews: [
        {
          id: 1,
          userId: 1,
          userName: 'Мария',
          rating: 5,
          comment: 'Очень хороший врач',
          date: '2024-03-15',
        },
      ],
      availability: {
        monday: [{ start: '09:00', end: '18:00' }],
        sunday: [],
      } as any,
      isLoading: false,
    });
  },
}));