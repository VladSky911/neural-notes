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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

// Компонент одной карточки с анимацией
const NoteCard = ({
  item,
  onPress,
  onLongPress,
}: {
  item: Note;
  onPress: () => void;
  onLongPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const plainContent = item.content.replace(/<[^>]*>/g, "").substring(0, 100);

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        onLongPress={onLongPress}
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
    </Animated.View>
  );
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);
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

  const renderItem = ({ item }: { item: Note }) => (
    <NoteCard
      item={item}
      onPress={() => navigation.navigate("NoteEditor", { noteId: item.id })}
      onLongPress={() => handleDelete(item.id)}
    />
  );

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

// Стили остаются без изменений
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.3)",
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
  cardDate: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 4,
  },
});
