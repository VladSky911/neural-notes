import React, { useState, useCallback, useLayoutEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadNotes, deleteNote } from "../storage/notesStorage";
import { Note } from "../types/note";
import { RootStackParamList } from "../navigation/AppNavigator";

type NotesNavigation = StackNavigationProp<RootStackParamList, "Notes">;

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const navigation = useNavigation<NotesNavigation>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
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

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sortedNotes;

    return sortedNotes.filter((note) => {
      const haystack = `${note.title} ${stripHtml(note.content)}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query, sortedNotes]);

  const notesToday = useMemo(() => {
    const today = new Date();
    return notes.filter((note) => {
      const updated = new Date(note.updatedAt);
      return (
        updated.getFullYear() === today.getFullYear() &&
        updated.getMonth() === today.getMonth() &&
        updated.getDate() === today.getDate()
      );
    }).length;
  }, [notes]);

  const latestNote = sortedNotes[0];

  const renderItem = ({ item }: { item: Note }) => {
    const plainContent = stripHtml(item.content).substring(0, 140);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("NoteEditor", { noteId: item.id })}
        onLongPress={() => handleDelete(item.id)}
        style={styles.card}
      >
        <View style={styles.cardTopRow}>
          <Text style={styles.cardDate}>{formatNoteDate(item.updatedAt)}</Text>
          <Text style={styles.cardMeta}>{formatWordCount(item.content)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title || "Untitled"}
        </Text>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {plainContent || "No content yet"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Neural Notes</Text>
          <Text style={styles.title}>Workspace</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => navigation.navigate("NoteEditor", {})}
          style={styles.createButton}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>Search</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Find notes, ideas, drafts"
          placeholderTextColor="#8b95a7"
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <View style={styles.summaryPanel}>
        <View>
          <Text style={styles.summaryLabel}>Total notes</Text>
          <Text style={styles.summaryValue}>{notes.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Updated today</Text>
          <Text style={styles.summaryValue}>{notesToday}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.latestBlock}>
          <Text style={styles.summaryLabel}>Latest</Text>
          <Text style={styles.latestText} numberOfLines={1}>
            {latestNote?.title || "No notes yet"}
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {query ? "Search results" : "Recent notes"}
        </Text>
        <Text style={styles.sectionCount}>{filteredNotes.length}</Text>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {query ? "Nothing found" : "Start your first note"}
            </Text>
            <Text style={styles.emptyText}>
              {query
                ? "Try another word or clear the search field."
                : "Capture an idea, draft, or meeting note and it will appear here."}
            </Text>
            {!query && (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => navigation.navigate("NoteEditor", {})}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Create note</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getWordCount = (html: string) => {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).length;
};

const formatWordCount = (html: string) => {
  const count = getWordCount(html);
  return `${count} ${count === 1 ? "word" : "words"}`;
};

const formatNoteDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fb", paddingHorizontal: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 18,
  },
  eyebrow: {
    color: "#617089",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#121826",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 2,
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#246bfe",
    shadowColor: "#246bfe",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 7,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "300",
  },
  searchBox: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    color: "#246bfe",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#121826",
    fontSize: 15,
    paddingVertical: 0,
  },
  summaryPanel: {
    marginTop: 16,
    backgroundColor: "#101828",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 5,
  },
  summaryLabel: {
    color: "#a9b6cc",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0,
    marginBottom: 6,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "800",
  },
  summaryDivider: {
    width: 1,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.13)",
    marginHorizontal: 16,
  },
  latestBlock: {
    flex: 1,
  },
  latestText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 4,
  },
  sectionTitle: {
    color: "#121826",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionCount: {
    minWidth: 30,
    textAlign: "center",
    color: "#617089",
    fontSize: 13,
    fontWeight: "800",
    backgroundColor: "#e7edf7",
    borderRadius: 12,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  listContent: { paddingTop: 8, paddingBottom: 32 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginVertical: 7,
    shadowColor: "#20304a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e8edf5",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#121826",
    marginBottom: 6,
  },
  cardPreview: {
    fontSize: 14,
    color: "#617089",
    lineHeight: 20,
  },
  cardDate: { fontSize: 12, color: "#246bfe", fontWeight: "800" },
  cardMeta: { fontSize: 12, color: "#8b95a7", fontWeight: "700" },
  emptyState: {
    marginTop: 32,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    backgroundColor: "#ffffff",
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#121826",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    color: "#617089",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: "#246bfe",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
});
