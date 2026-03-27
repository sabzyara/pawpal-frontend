import { usePets } from "@/store/petStore";
import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  const { pets } = usePets();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Мои питомцы 🐶</Text>

      <Button
        title="Добавить питомца"
        onPress={() => router.push("/(tabs)/add")}
      />

      {pets.length === 0 ? (
        <Text style={{ marginTop: 20 }}>Питомцев пока нет</Text>
      ) : (
        pets.map((pet, index) => <Text key={index}>🐾 {pet}</Text>)
      )}
    </View>
  );
}
