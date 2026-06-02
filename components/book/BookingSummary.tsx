import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
}

interface BookingSummaryProps {
  pet?: Pet;
  specialistName: string;
  date: Date | null;
  timeSlot: string | null;
  onConfirm: () => void;
  loading: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  pet,
  specialistName,
  date,
  timeSlot,
  onConfirm,
  loading,
}) => {
  const { colors, typography } = useTheme();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const SummaryRow = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Ionicons name={icon as any} size={20} color={colors.primary.main} />
        <Text style={[typography.body2, { color: colors.text.secondary }]}>{label}</Text>
      </View>
      <Text style={[typography.body1SemiBold, { color: colors.text.primary }]}>{value}</Text>
    </View>
  );

  return (
    <View>
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: 8 }]}>
        Подтверждение записи
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginBottom: 20 }]}>
        Пожалуйста, проверьте детали записи
      </Text>

      {/* Детали записи */}
      <View
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 20,
          padding: 16,
          marginBottom: 20,
          ...(colors.card.default === '#FFFFFF' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }),
        }}
      >
        <Text style={[typography.body1SemiBold, { color: colors.text.primary, marginBottom: 16 }]}>
          Детали приема
        </Text>

        <SummaryRow
          label="Питомец"
          value={`${pet?.name} (${pet?.breed})`}
          icon="paw"
        />
        <SummaryRow
          label="Специалист"
          value={specialistName}
          icon="person"
        />
        <SummaryRow
          label="Дата"
          value={date ? formatDate(date) : 'Не выбрана'}
          icon="calendar"
        />
        <SummaryRow
          label="Время"
          value={timeSlot ? formatTime(timeSlot) : 'Не выбрано'}
          icon="time"
        />
      </View>

      {/* Информация */}
      <View
        style={{
          backgroundColor: colors.primary.main + '10',
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Ionicons name="information-circle" size={20} color={colors.primary.main} />
        <Text style={[typography.caption, { color: colors.text.secondary, flex: 1 }]}>
          Специалист подтвердит вашу запись. Вы получите уведомление после подтверждения.
        </Text>
      </View>

      {/* Кнопка подтверждения */}
      <TouchableOpacity
        onPress={onConfirm}
        disabled={loading}
        style={{
          backgroundColor: colors.primary.main,
          padding: 18,
          borderRadius: 16,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.text.inverse} />
        ) : (
          <Text style={[typography.button, { color: colors.text.inverse }]}>
            Подтвердить запись
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};