import { ThemeColors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  colors: ThemeColors;
};

export default function SettingsItem({
  title,
  subtitle,
  icon,
  onPress,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text>{title}</Text>
          <Text>{subtitle}</Text>
        </View>

        <Feather name={icon as any} size={20} />
      </View>
    </TouchableOpacity>
  );
}