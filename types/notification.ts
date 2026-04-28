export type NotificationType =
  | 'AI_RECOMMENDATION'
  | 'FEEDING_REMINDER'
  | 'WALK_REMINDER'
  | 'MEDICAL_REMINDER';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}