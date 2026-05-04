// src/components/GlassHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function GlassHeader({ title, rightButtons, leftButton }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>{leftButton}</View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{rightButtons}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  title: { fontSize: 22, fontWeight: "600", color: "#1c1c1e" },
  left: { minWidth: 40 },
  right: { flexDirection: "row", gap: 16 },
});
