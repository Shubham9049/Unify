import { View, StatusBar, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { tokenCache } from "./cache";

// Prevent the splash screen from hiding until we explicitly hide it
SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [appReady, setAppReady] = useState(false); // Tracks when app setup is complete
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsLogin(!!token); // Set login state based on token presence
      } catch (error) {
        console.error("Error reading token from AsyncStorage:", error);
        setIsLogin(false);
      } finally {
        SplashScreen.hideAsync(); // Hide splash screen after setup
        setAppReady(true); // Indicate that the app is ready
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    // Show a loading screen while the app is being prepared
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        {/* Global StatusBar configuration */}
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        {/* App navigation stack */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* Root Layout must render Slot for navigation to work */}
          <Slot />
        </Stack>
        {/* Handle navigation after layout is mounted */}
        {isLogin !== null && <AuthRedirect isLogin={isLogin} />}
      </ClerkLoaded>
    </ClerkProvider>
  );
};

const AuthRedirect = ({ isLogin }: { isLogin: boolean }) => {
  const { isSignedIn } = useAuth();
  // Redirect user after layout is fully mounted
  if (isSignedIn || isLogin === true) {
    // Redirect to the main stack if the user is signed in
    return <Redirect href="/(main)" />;
  }
  if (isLogin === false) {
    // Redirect to the authentication stack if the user is not signed in
    return <Redirect href="/(auth)" />;
  }
};

export default RootNavigation;
