import React, { useEffect, useState } from "react";
import { Drawer } from "expo-router/drawer";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const { user } = useUser();
  const [authToken, setAuthToken] = useState("");
  const [storedUsername, setStoredUsername] = useState("");
  const [storedEmail, setStoredEmail] = useState("");

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem("authToken", userId);
        }
        const token = await AsyncStorage.getItem("authToken");
        const username = await AsyncStorage.getItem("username");
        const email = await AsyncStorage.getItem("email");
        setAuthToken(token || "No token found");
        setStoredUsername(username || "Guest");
        setStoredEmail(email || "No email found");
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("email");
      await signOut();
      router.push("/(auth)");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const userName = user?.fullName || storedUsername;
  const userEmail = user?.primaryEmailAddress?.emailAddress || storedEmail;

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.profileSection}>
        {/* Display user image or first letter of the name */}
        {user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>

        {/* Logout button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="index" options={{ title: "Home" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "flex-start", // Align everything to the left
  },
  profileSection: {
    marginTop: 20,
    alignItems: "flex-start", // Ensure profile section is aligned to the left
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileInitial: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    alignSelf: "flex-start", // Ensure the name is aligned to the left
  },
  userEmail: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
    alignSelf: "flex-start", // Ensure the email is aligned to the left
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20, // Adjust to fit the text
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignSelf: "flex-start", // Align button to the left
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
