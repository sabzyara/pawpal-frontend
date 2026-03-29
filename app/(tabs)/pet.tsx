import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PetScreen() {
  return (
  <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Барсик 🐱</Text>

      <Text>Кормления:</Text>
      <Text>- 08:00</Text>

      <Text style={{ marginTop: 10 }}>Активность:</Text>
      <Text>- Прогулка 30 мин</Text>

      <Button title="Добавить запись" />
    </View>
  </SafeAreaView>
  );
}
