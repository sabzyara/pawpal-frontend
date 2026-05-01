import { ThemeColors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type InfoItem = {
  icon: string;
  label: string;
  value: string;
};

type Props = {
  title: string;
  items: InfoItem[];
  colors: ThemeColors;
};

export default function InfoSection({ title, items, colors }: Props) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: '700', marginBottom: 10 }}>
        {title}
      </Text>

      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Feather name={item.icon as any} size={20} color={colors.text.tertiary} />

          <View style={{ marginLeft: 10 }}>
            <Text>{item.label}</Text>
            <Text>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}