import { View, Text, StyleSheet } from "react-native";

export default function NoteEditorScreen() {
  return (
    <View style={styles.container}>
      <Text>Редактор заметок</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
