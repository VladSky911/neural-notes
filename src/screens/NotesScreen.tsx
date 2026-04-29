import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loadNotes, deleteNote } from "../storage/notesStorage";
import { Note } from "../types/note";

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigation = useNavigation();

  const fetchNotes = async () => {
    const loaded = await loadNotes();
    setNotes(loaded);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, []),
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(id);
          fetchNotes();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("NoteEditor", { noteId: item.id })
            }
            onLongPress={() => handleDelete(item.id)}
          >
            <Text style={styles.noteTitle}>{item.title || "Untitled"}</Text>
            <Text style={styles.noteDate}>
              {new Date(item.updatedAt).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No notes yet. Tap + to create.</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("NoteEditor", {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  noteItem: { padding: 16, borderBottomWidth: 1, borderColor: "#ccc" },
  noteTitle: { fontSize: 18, fontWeight: "bold" },
  noteDate: { fontSize: 12, color: "#888", marginTop: 4 },
  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { fontSize: 28, color: "#fff", fontWeight: "bold" },
});
