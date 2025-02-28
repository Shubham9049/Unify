import { View, StatusBar, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import { Slot } from "expo-router";
import { tokenCache } from "./cache";
// Redux Imports
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../redux/store";

// Prevent the splash screen from hiding until we explicitly hide it
SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

const RootNavigation = () => {
  const [appReady, setAppReady] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem("email");
        setHasToken(!!token); // Check token presence
      } catch (error) {
        console.error("Error reading token from AsyncStorage:", error);
        setHasToken(false);
      } finally {
        setAppReady(true); // Indicate the app is ready
        SplashScreen.hideAsync(); // Hide splash screen
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    // Show loading screen until app is ready
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
          <Stack screenOptions={{ headerShown: false }}>
            <Slot />
          </Stack>
          {hasToken !== null && <AuthRedirect hasToken={hasToken} />}
        </ClerkLoaded>
      </ClerkProvider>
    </Provider>
  );
};

const AuthRedirect = ({ hasToken }: { hasToken: boolean }) => {
  const { isSignedIn } = useAuth();

  // Decide redirection based on token and Clerk auth state
  if (isSignedIn || hasToken) {
    return <Redirect href="/(main)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }
};

export default RootNavigation;
