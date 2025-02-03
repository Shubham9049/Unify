import React, { useEffect, useState } from "react";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "./CustomDrawerContent";

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
      <Drawer.Screen name="Profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="chat" options={{ title: "Chat" }} />
      <Drawer.Screen name="chatScreen" options={{ title: "Chat Screen" , drawerItemStyle:{display:"none"}}} />
    </Drawer>
  );
}
