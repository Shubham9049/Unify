import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const AuthStack = () => {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="loginScreen" />
    </Stack>
  );
};

export default AuthStack;
