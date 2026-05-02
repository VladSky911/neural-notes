import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function GlassButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={70} tint="light" style={styles.button}>
        <Text style={styles.buttonText}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#007AFF",
  },
});
