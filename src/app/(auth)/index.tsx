import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Using Expo vector icons
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications'; 

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Request permissions for notifications when the app is launched
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Notification permissions are required for this feature.');
      }
    };
  
    requestPermissions();
  
    // Set up a handler for when notifications are received while the app is in the foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,   // Show alert when notification is received
        shouldPlaySound: true,   // Play sound for notification
        shouldSetBadge: false,   // Optionally set a badge count for the app
      }),
    });
  
    // Listener for when a notification is received while the app is in the foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      // You can show an alert or log the notification here
    });
  
    // Cleanup the listener when the component is unmounted
    return () => {
      notificationListener.remove();
    };
  }, []);
  

  const sendWelcomeNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Welcome Back!",
        body: "You're successfully logged in!",
      },
      trigger: null, // This triggers the notification immediately
    });
  };

  const validateInputs = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters long';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      const response = await fetch('https://app-database.onrender.com/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        // Store the token in Async Storage
        await AsyncStorage.setItem('authToken', data.token);

        // Trigger a notification
        sendWelcomeNotification();

        // Navigate to the main screen
        router.push('/(main)');
      } else {
        alert(data.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setLoading(false); // Stop loading after the login attempt
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* UI Components */}
      <Image
        source={{ uri: 'https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg' }}
        style={styles.logo}
      />
      <TextInput
        placeholder="Email"
        style={[styles.input, errors.email ? styles.inputError : null]}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          style={[styles.input, errors.password ? styles.inputError : null]}
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.iconContainer}
        >
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      <TouchableOpacity>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      <View style={styles.registrationContainer}>
        <Text style={styles.registrationText}>Don't have an account?</Text>
        <TouchableOpacity>
          <Text
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius:75,
    alignSelf: 'center',
    marginBottom: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  passwordContainer: {
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  forgotPasswordText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
  },
  registrationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registrationText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007bff',
    fontSize: 14,
  },
});

export default Index;
