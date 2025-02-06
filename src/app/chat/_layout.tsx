import { Stack } from "expo-router";
import React from "react";

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Chat" }} />
      <Stack.Screen name="chat-screen" options={{ title: "Chat Screen" }} />
    </Stack>
  );
}
