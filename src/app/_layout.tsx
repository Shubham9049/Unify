import { View, Alert, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";

// Prevent the splash screen from hiding until we explicitly hide it
SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  /**
   * Request notification permissions from the user.
   */
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Notification permissions granted.");
      getFcmToken(); // Fetch the FCM token
    } else {
      console.log("Notification permissions denied.");
    }
  };

  /**
   * Retrieve the FCM token for the device.
   */
  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log("FCM Token:", token);
        // Send the token to your backend for notifications if needed
      } else {
        console.log("Failed to fetch FCM token.");
      }
    } catch (error) {
      console.error("Error fetching FCM token:", error);
    }
  };

  /**
   * Handle notification interactions.
   */
  const handleNotificationInteraction = () => {
    // App opened from background by tapping on a notification
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification opened from background state:",
        remoteMessage.notification
      );
      Alert.alert(
        remoteMessage.notification?.title || "",
        remoteMessage.notification?.body || ""
      );
    });

    // App launched from a notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
          Alert.alert(
            remoteMessage.notification?.title || "",
            remoteMessage.notification?.body || ""
          );
        }
      });
  };

  /**
   * Check login status by reading the authentication token from AsyncStorage.
   */
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setIsLogin(!!token); // Set true if token exists, false otherwise
      } catch (error) {
        console.error("Error reading token from AsyncStorage:", error);
        setIsLogin(false); // Consider user not logged in on error
      } finally {
        SplashScreen.hideAsync(); // Hide splash screen after checking
      }
    };

    checkLoginStatus();
  }, []);

  /**
   * Setup Firebase messaging listeners for notifications.
   */
  useEffect(() => {
    requestUserPermission(); // Ask for notification permissions
    handleNotificationInteraction(); // Handle notification taps

    // Listen for foreground notifications
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Notification received in foreground:", remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || "",
        remoteMessage.notification?.body || ""
      );
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  if (isLogin === null) {
    // Show a loading state (or splash screen) while checking login status
    return null;
  }

  return (
    <>
      {/* Global StatusBar configuration */}
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      {/* App navigation stack */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* Redirect user based on login status */}
      {isLogin ? <Redirect href="/(main)" /> : <Redirect href="/(auth)" />}
    </>
  );
};

export default RootNavigation;
