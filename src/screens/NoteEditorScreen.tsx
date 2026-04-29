import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { useRoute, useNavigation } from "@react-navigation/native";
import { loadNotes, addNote, updateNote } from "../storage/notesStorage";
import { Note } from "../types/note";

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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TextInput
          style={{ marginRight: 15, fontSize: 18, color: "#007AFF" }}
          onPress={saveNote}
          value="Save"
        />
      ),
    });
  }, [navigation, title, content]);

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
