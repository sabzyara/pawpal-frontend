import { ThemeColors } from '@/styles/colors';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  colors: ThemeColors;
};

export default function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={colors.primary.gradient}
        style={{ padding: 16, borderRadius: 12 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text>{title}</Text>
            <Text>{subtitle}</Text>
          </View>

          <Feather name={icon as any} size={20} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}