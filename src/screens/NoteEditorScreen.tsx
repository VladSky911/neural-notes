import React, { useState, useEffect, useRef } from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { useRoute, useNavigation } from "@react-navigation/native";
import { loadNotes, addNote, updateNote } from "../storage/notesStorage";
import { Note } from "../types/note";
import {
  summarizeNote,
  rewriteNote,
  generateTags,
} from "../services/aiService";

export default function NoteEditorScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { noteId } = route.params as { noteId?: string };
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const richTextRef = useRef<RichEditor>(null);

  useEffect(() => {
    if (noteId) {
      loadNotes().then((notes) => {
        const note = notes.find((n) => n.id === noteId);
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          if (richTextRef.current) {
            richTextRef.current.setContentHTML(note.content);
          }
        }
      });
    }
  }, [noteId]);

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
      console.error(error);
      Alert.alert("Error", "Failed to summarize. Check API key.");
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
    Alert.alert("Rewrite style", "Choose a style for the rewritten note", [
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
      // Заменяем текущее содержимое
      richTextRef.current?.setContentHTML(rewritten);
      setContent(rewritten);
    } catch (error) {
      Alert.alert("Error", "Failed to rewrite note");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={handleAISummary}
            style={{ marginRight: 15 }}
          >
            <Text style={styles.headerButtonText}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGenerateTags}
            style={{ marginRight: 15 }}
          >
            <Text style={styles.headerButtonText}>Tags</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveNote}>
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, saveNote, handleGenerateTags]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <RichEditor
        ref={richTextRef}
        style={styles.editor}
        initialContentHTML={content}
        onChange={(html) => setContent(html)}
      />
      <RichToolbar editor={richTextRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  titleInput: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  editor: { flex: 1, marginTop: 10, marginHorizontal: 10 },
  headerButtonText: {
    fontSize: 18,
    color: "#007AFF",
  },
});
