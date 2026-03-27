import { Button, Text, View } from "react-native";

export default function PetScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Барсик 🐱</Text>

      <Text>Кормления:</Text>
      <Text>- 08:00</Text>

      <Text style={{ marginTop: 10 }}>Активность:</Text>
      <Text>- Прогулка 30 мин</Text>

      <Button title="Добавить запись" />
    </View>
  );
}
