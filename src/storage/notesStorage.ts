import AsyncStorage from "@react-native-async-storage/async-storage";
import { Note } from "../types/note";

const STORAGE_KEY = "@neural_notes";

export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    const json = JSON.stringify(notes);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error("Failed to save notes", e);
  }
};

export const loadNotes = async (): Promise<Note[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const addNote = async (note: Note): Promise<void> => {
  const notes = await loadNotes();
  notes.unshift(note); // новые в начало
  await saveNotes(notes);
};

export const updateNote = async (
  id: string,
  updatedNote: Partial<Note>,
): Promise<void> => {
  const notes = await loadNotes();
  const index = notes.findIndex((n) => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updatedNote, updatedAt: Date.now() };
    await saveNotes(notes);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  const notes = await loadNotes();
  const filtered = notes.filter((n) => n.id !== id);
  await saveNotes(filtered);
};

// Черновик (для новой заметки)
const DRAFT_KEY = "@note_draft";

export const saveDraft = async (draft: {
  title: string;
  content: string;
}): Promise<void> => {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error("Failed to save draft", e);
  }
};

export const loadDraft = async (): Promise<{
  title: string;
  content: string;
} | null> => {
  try {
    const json = await AsyncStorage.getItem(DRAFT_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.error("Failed to load draft", e);
    return null;
  }
};

export const clearDraft = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error("Failed to clear draft", e);
  }
};
