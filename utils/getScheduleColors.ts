import { ThemeColors } from '@/styles/colors';
import { ScheduleType } from '@/types/home_index';

export const getScheduleColors = (
  type: ScheduleType,
  colors: ThemeColors
): readonly [string, string] => {
  switch (type) {
    case 'vet':
      return colors.primary.gradient;

    case 'walk':
      return colors.secondary.gradient;

    case 'medication':
      return [colors.primary.light, colors.secondary.light];

    case 'grooming':
      return [colors.secondary.main, colors.primary.light];

    default:
      return colors.primary.gradient;
  }
};