import { usePets } from "@/store/petStore";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function AddScreen() {
  const [name, setName] = useState("");
  const { addPet } = usePets();

  const handleSave = () => {
    if (name) {
      addPet(name);
      router.back();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Имя питомца</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginVertical: 10 }}
      />

      <Button title="Сохранить" onPress={handleSave} />
    </View>
  );
}
