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
import { summarizeNote } from "../services/aiService";

export default function NoteEditorScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { noteId } = route.params as { noteId?: string };
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

  const [isLoading, setIsLoading] = useState(false);

  const handleAISummary = async () => {
    if (!content.trim()) {
      Alert.alert("Info", "Write something first");
      return;
    }
    setIsLoading(true);
    try {
      const summary = await summarizeNote(content);
      setContent((prev) => prev + `\n\n---\n✨ AI Summary: ${summary}`);
    } catch (error) {
      Alert.alert("Error", "Failed to summarize. Check API key.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={handleAISummary}>
            <Text style={{ marginRight: 15, fontSize: 18, color: "#007AFF" }}>
              AI
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveNote}>
            <Text style={{ fontSize: 18, color: "#007AFF" }}>Save</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, saveNote]);

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
});
