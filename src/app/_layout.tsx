import { View, StatusBar, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Slot } from "expo-router";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const [appReady, setAppReady] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await AsyncStorage.getItem("email");
        setHasToken(!!token);
      } catch (error) {
        console.error("Error reading token from AsyncStorage:", error);
        setHasToken(false);
      } finally {
        // Increase splash screen duration (e.g., 2 seconds)
        setTimeout(async () => {
          setAppReady(true);
          await SplashScreen.hideAsync();
        }, 2000);
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <Stack screenOptions={{ headerShown: false }}>
        <Slot />
      </Stack>
      {hasToken !== null && <AuthRedirect hasToken={hasToken} />}
    </Provider>
  );
};

const AuthRedirect = ({ hasToken }: { hasToken: boolean }) => {
  return hasToken ? <Redirect href="/(main)" /> : <Redirect href="/(auth)" />;
};

export default RootNavigation;
