import { ThemeColors } from '@/styles/colors';
import { Image, Text, View } from 'react-native';

type Props = {
  avatar: string;
  name: string;
  role: string;
  email: string;
  colors: ThemeColors;
}; 

export default function ProfileHeader({
  avatar,
  name,
  role,
  email,
  colors,
}: Props) {
  return (
    <View style={{
      flexDirection: 'row',
      padding: 16,
      margin: 16,
      borderRadius: 16,
      backgroundColor: colors.card.elevated,
    }}>
      <Image source={{ uri: avatar }} style={{ width: 70, height: 70, borderRadius: 35 }} />

      <View style={{ marginLeft: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>
          {name}
        </Text>
        <Text style={{ color: colors.text.secondary }}>{role}</Text>
        <Text style={{ color: colors.text.tertiary }}>{email}</Text>
      </View>
    </View>
  );
}