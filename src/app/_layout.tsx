import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const RootNavigation = () => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setIsLogin(true); // Token found, user is logged in
        } else {
          setIsLogin(false); // No token, user is not logged in
        }
      } catch (error) {
        console.error('Error reading token from AsyncStorage:', error);
        setIsLogin(false); // In case of an error, consider the user not logged in
      } finally {
        // Hide the splash screen after checking the token
        SplashScreen.hideAsync();
      }
    };

    checkLoginStatus();
  }, []);

  if (isLogin === null) {
    // Show a loading state (or splash screen) while checking login status
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {isLogin ? <Redirect href="/(main)" /> : <Redirect href="/(auth)" />}
    </>
  );
};

export default RootNavigation;
