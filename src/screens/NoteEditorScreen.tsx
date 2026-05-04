import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Alert, View, StyleSheet, TextInput } from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { useRoute, useNavigation } from "@react-navigation/native";
import { loadNotes, addNote, updateNote } from "../storage/notesStorage";
import { Note } from "../types/note";
import {
  summarizeNote,
  rewriteNote,
  generateTags,
} from "../services/aiService";
import GlassHeader from "../components/GlassHeader";
import GlassButton from "../components/GlassButton";

export default function NoteEditorScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const noteId = route.params?.noteId;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const richTextRef = useRef<RichEditor>(null);

  // Скрываем стандартный хедер
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Загрузка существующей заметки
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
      richTextRef.current?.setContentHTML(rewritten);
      setContent(rewritten);
    } catch (error) {
      Alert.alert("Error", "Failed to rewrite note");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlassHeader
        title="Edit Note"
        rightButtons={
          <View style={{ flexDirection: "row", gap: 12 }}>
            <GlassButton title="AI" onPress={handleAISummary} />
            <GlassButton title="Tags" onPress={handleGenerateTags} />
            <GlassButton title="RW" onPress={handleRewrite} />
            <GlassButton title="Save" onPress={saveNote} />
          </View>
        }
      />
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
      <RichToolbar editor={richTextRef} style={styles.toolbar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },

  editorContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // почти белый, но лёгкая полупрозрачность
    borderRadius: 24,
    marginHorizontal: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  editor: {
    flex: 1,
    backgroundColor: "transparent", // это для самого компонента
  },
  toolbar: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 0,
  },
});
