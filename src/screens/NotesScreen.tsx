import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { loadNotes, deleteNote } from "../storage/notesStorage";
import { Note } from "../types/note";
import { useLayoutEffect } from "react";

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Прячем стандартный хедер (но оставляем возможность добавить свою кнопку)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("NoteEditor")}>
          <Text
            style={{
              fontSize: 28,
              marginRight: 15,
              fontWeight: "300",
              color: "#007AFF",
            }}
          >
            +
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchNotes = async () => {
    const loaded = await loadNotes();
    setNotes(loaded);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

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

  const renderItem = ({ item }: { item: Note }) => {
    const plainContent = item.content.replace(/<[^>]*>/g, "").substring(0, 100);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("NoteEditor", { noteId: item.id })}
        onLongPress={() => handleDelete(item.id)}
        style={styles.card}
      >
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || "Untitled"}
        </Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {plainContent || "No content"}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9ff" },
  listContent: { paddingTop: 16, paddingBottom: 32 },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.96)", // почти белый, но не полностью
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1c1c1e",
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 14,
    color: "#3a3a3c",
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: { fontSize: 12, color: "#8e8e93", marginTop: 4 },
});
