import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Alert,
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import {
  loadNotes,
  addNote,
  updateNote,
  saveDraft,
  loadDraft,
  clearDraft,
} from "../storage/notesStorage";
import { Note } from "../types/note";
import {
  summarizeNote,
  rewriteNote,
  generateTags,
} from "../services/aiService";
import { RootStackParamList } from "../navigation/AppNavigator";

type NoteEditorRoute = RouteProp<RootStackParamList, "NoteEditor">;

export default function NoteEditorScreen() {
  const route = useRoute<NoteEditorRoute>();
  const navigation = useNavigation();
  const noteId = route.params?.noteId;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const richTextRef = useRef<RichEditor>(null);
  const insets = useSafeAreaInsets();

  // Загрузка существующей заметки или черновика
  useEffect(() => {
    if (noteId) {
      loadNotes().then((notes) => {
        const note = notes.find((n) => n.id === noteId);
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          richTextRef.current?.setContentHTML(note.content);
        }
      });
    } else {
      loadDraft().then((draft) => {
        if (draft && (draft.title || draft.content)) {
          setTitle(draft.title);
          setContent(draft.content);
          richTextRef.current?.setContentHTML(draft.content);
        }
      });
    }
  }, [noteId]);

  // Автосохранение черновика (только для новой заметки)
  useEffect(() => {
    if (noteId) return;
    const timeoutId = setTimeout(() => {
      if (title.trim() || content.trim()) {
        saveDraft({ title, content });
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, content, noteId]);

  const saveNote = async () => {
    const now = Date.now();
    if (noteId) {
      await updateNote(noteId, { title, content, updatedAt: now });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        updatedAt: now,
      };
      await addNote(newNote);
      await clearDraft();
    }
    navigation.goBack();
  };

  const handleAISummary = async () => {
    if (!content.trim()) {
      Alert.alert("Info", "Write something first");
      return;
    }
    setIsLoading(true);
    try {
      const summary = await summarizeNote(content);
      const summaryHtml = `<br/><br/>---<br/>✨ AI Summary: ${summary}`;
      richTextRef.current?.insertHTML(summaryHtml);
      setContent((prev) => prev + summaryHtml);
    } catch (error) {
      Alert.alert("Error", "Failed to summarize");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!content.trim()) {
      Alert.alert("Info", "Write something first");
      return;
    }
    setIsLoading(true);
    try {
      const tags = await generateTags(content);
      const tagsText = tags.join(", ");
      Alert.alert("Suggested Tags", tagsText, [
        {
          text: "Add to note",
          onPress: () => {
            const tagsHtml = `<br/><br/>🏷️ Tags: ${tagsText}`;
            richTextRef.current?.insertHTML(tagsHtml);
            setContent((prev) => prev + tagsHtml);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to generate tags");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewrite = () => {
    if (!content.trim()) {
      Alert.alert("Info", "Write something first");
      return;
    }
    Alert.alert("Rewrite style", "Choose a style", [
      { text: "Professional", onPress: () => performRewrite("professional") },
      { text: "Casual", onPress: () => performRewrite("casual") },
      { text: "Simple", onPress: () => performRewrite("simple") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const performRewrite = async (
    style: "professional" | "casual" | "simple",
  ) => {
    setIsLoading(true);
    try {
      const rewritten = await rewriteNote(content, style);
      richTextRef.current?.setContentHTML(rewritten);
      setContent(rewritten);
    } catch (error) {
      Alert.alert("Error", "Failed to rewrite");
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.customHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.headerTitle}>Edit Note</Text>
          {isDraftSaved && <Text style={styles.draftBadge}>Draft saved</Text>}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleAISummary}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGenerateTags}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Tags</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRewrite} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>RW</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveNote} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.editorContainer}>
        <RichEditor
          ref={richTextRef}
          style={styles.editor}
          initialContentHTML={content}
          onChange={(html) => setContent(html)}
        />
      </View>

      <RichToolbar
        editor={richTextRef}
        style={[styles.toolbar, { paddingBottom: insets.bottom + 10 }]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9ff" },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "#1c1c1e" },
  draftBadge: {
    fontSize: 12,
    color: "#34c759",
    fontWeight: "500",
    backgroundColor: "rgba(52,199,89,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  headerButtons: { flexDirection: "row", gap: 12 },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  headerButtonText: { fontSize: 15, fontWeight: "500", color: "#007AFF" },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  editorContainer: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    marginHorizontal: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  editor: { flex: 1, backgroundColor: "transparent" },
  toolbar: { backgroundColor: "rgba(255,255,255,0.9)", borderTopWidth: 0 },
});
