import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

const ChatScreen = () => {
  const { user } = useLocalSearchParams(); // Fetch user param

  // Ensure user is always a string before parsing
  const selectedUser = user && typeof user === "string" ? JSON.parse(user) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Chat with {selectedUser?.username || "Unknown User"}
      </Text>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  header: { fontSize: 20, fontWeight: "bold" },
});
