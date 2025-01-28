import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";

export default function App() {
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const { user } = useUser(); // Fetch user details
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem("authToken", userId); // Save userId as token
        }
        const token = await AsyncStorage.getItem("authToken");
        console.log(token);
        setAuthToken(token || "No token found");
      } catch (error) {
        console.error("Error fetching auth token:", error);
      }
    };

    fetchAuthToken();
  }, []);

  const handleLogout = async () => {
    try {
      // Remove the auth token from AsyncStorage
      await AsyncStorage.removeItem("authToken");
      // Clerk's signOut functionality
      await signOut();
      // Navigate to the login screen
      router.push("/(auth)");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const userName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg",
          }} // Replace with your logo URL
          style={styles.logo}
        />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <View style={styles.content}>
        <Text>Welcome, {userName}!</Text>
        <Text>Email: {userEmail}</Text>
        <Image
          source={{ uri: user?.imageUrl }}
          style={{ borderRadius: 10, width: 100, height: 100 }} // Add width and height for proper rendering
        />

        <View style={styles.credentialsContainer}>
          <Text style={styles.credentialsText}>
            <Text style={styles.label}>User ID:</Text>{" "}
            {userId || "Not logged in"}
          </Text>
          <Text style={styles.credentialsText}>
            <Text style={styles.label}>Auth Token:</Text> {authToken}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#007bff",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoutButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  content: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  credentialsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    width: "90%",
  },
  credentialsText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
});
