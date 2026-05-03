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

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BookingSummaryProps {
  pet?: Pet;
  vetName: string;
  date: Date | null;
  timeSlot: string | null;
  service?: Service;
  onConfirm: () => void;
  loading: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  pet,
  vetName,
  date,
  timeSlot,
  service,
  onConfirm,
  loading,
}) => {
  const { colors, spacing, typography } = useTheme();

  const totalPrice = service?.price || 0;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + tax;

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

  const PriceRow = ({ label, price }: { label: string; price: number }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
      }}
    >
      <Text style={[typography.body2, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[typography.body2, { color: colors.text.primary }]}>${price.toFixed(2)}</Text>
    </View>
  );

  return (
    <View>
      <Text style={[typography.h3, { color: colors.text.primary, marginBottom: 8 }]}>
        Confirm Appointment
      </Text>
      <Text style={[typography.body2, { color: colors.text.secondary, marginBottom: 20 }]}>
        Please review your booking details
      </Text>

      {/* Booking Details */}
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
          Appointment Details
        </Text>

        <SummaryRow
          label="Pet"
          value={`${pet?.name} (${pet?.breed})`}
          icon="paw"
        />
        <SummaryRow
          label="Veterinarian"
          value={vetName}
          icon="person"
        />
        <SummaryRow
          label="Date"
          value={date ? date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          }) : 'Not selected'}
          icon="calendar"
        />
        <SummaryRow
          label="Time"
          value={timeSlot || 'Not selected'}
          icon="time"
        />
        <SummaryRow
          label="Service"
          value={service?.name || 'Not selected'}
          icon="medkit"
        />
        <SummaryRow
          label="Duration"
          value={service?.duration ? `${service.duration} min` : 'N/A'}
          icon="hourglass"
        />
      </View>

      {/* Price Breakdown */}
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
          Payment Summary
        </Text>

        <PriceRow label="Service Fee" price={totalPrice} />
        <PriceRow label="Tax (8%)" price={tax} />
        
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 12,
            marginTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border.light,
          }}
        >
          <Text style={[typography.h4, { color: colors.text.primary }]}>Total</Text>
          <Text style={[typography.h4, { color: colors.primary.main }]}>
            ${grandTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Confirm Button */}
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
            Confirm & Pay
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};