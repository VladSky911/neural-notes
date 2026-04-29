import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";

export default function NoteEditorScreen() {
  const richTextRef = useRef<RichEditor>(null);

  return (
    <View style={styles.container}>
      <RichEditor
        ref={richTextRef}
        style={styles.editor}
        initialContentHTML="<p>Start writing...</p>"
      />
      <RichToolbar editor={richTextRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  editor: { flex: 1, marginTop: 10, marginHorizontal: 10 },
});
