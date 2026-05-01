import ActionCard from '@/components/profile/ActionCard';
import { ThemeColors } from '@/styles/colors';
import { Role } from '@/types/profile';
import { View } from 'react-native';

type Props = {
  role: Role;
  colors: ThemeColors;
  handlers: {
    pets: () => void;
    appointments: () => void;
  };
};

export default function RoleActions({ role, handlers, colors }: Props) {
  if (role === Role.OWNER) {
    return (
      <View style={{ padding: 16 }}>
        <ActionCard
          title="My Pets"
          subtitle="Manage pets"
          icon="paw"
          onPress={handlers.pets}
          colors={colors}
        />

        <ActionCard
          title="Appointments"
          subtitle="Bookings"
          icon="calendar"
          onPress={handlers.appointments}
          colors={colors}
        />
      </View>
    );
  }

  return null;
}