import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    // Request permissions for push notifications
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    // Listener for when the app is in the foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification); // Notification state update
    });

    // Listener for when the user interacts with the notification (e.g., taps it)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    // Cleanup on unmount
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    // If the app is running on a physical device, request permission
    if (Platform.OS === 'android') {
      await Notifications.requestPermissionsAsync();
    }

    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Expo Push Token:', token.data);
    return token.data;  // This is the token that you'll use to send notifications
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    router.push('/(auth)'); // Navigate to login screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg' }} // Replace with your logo URL
          style={styles.logo}
        />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Unify!</Text>
        

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007bff',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
