import { ThemeColors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

type Stat = {
  value: string;
  label: string;
  icon: string;
};

type Props = {
  stats: Stat[];
  colors: ThemeColors;
};

export default function ProfileStats({ stats, colors }: Props) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
      {stats.map((stat, i) => (
        <LinearGradient
          key={i}
          colors={[colors.card.default, colors.card.elevated]}
          style={{
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            width: '30%',
          }}
        >
          <Feather name={stat.icon as any} size={20} color={colors.primary.main} />
          <Text>{stat.value}</Text>
          <Text>{stat.label}</Text>
        </LinearGradient>
      ))}
    </View>
  );
}