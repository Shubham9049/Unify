import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { setProfileImage } from "../../redux/profileSlice";
import { Ionicons } from "@expo/vector-icons"; // Importing Ionicons for icons
import { router } from "expo-router";

function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { signOut } = useClerk();
  const { userId } = useAuth();
  const { user } = useUser();
  const [authToken, setAuthToken] = useState("");
  const [storedUsername, setStoredUsername] = useState("");
  const [storedEmail, setStoredEmail] = useState("");
  const dispatch = useDispatch();
  const profileImage = useSelector((state: any) => state.profile.profileImage);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem("authToken", userId);
        }
        const token = await AsyncStorage.getItem("authToken");
        const username = await AsyncStorage.getItem("username");
        const email = await AsyncStorage.getItem("email");
        const image = await AsyncStorage.getItem("profileImage");
        setAuthToken(token || "No token found");
        setStoredUsername(username || "Guest");
        setStoredEmail(email || "No email found");
        // Check if profile image exists in AsyncStorage and update Redux state
        if (image) {
          dispatch(setProfileImage(image));
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("email");
      await AsyncStorage.removeItem("profileImage");
      await AsyncStorage.removeItem("mongoId");
      await signOut();
      router.push("/(auth)");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const userName = user?.fullName || storedUsername;
  const userEmail = user?.primaryEmailAddress?.emailAddress || storedEmail;
  const displayImage = user?.imageUrl || profileImage || null;

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.profileSection}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Border below user info */}
        <View style={styles.userInfoBorder}></View>
      </View>

      {/* Home and Profile sections with icons */}
      <TouchableOpacity
        onPress={() => navigation.navigate("index")}
        style={styles.drawerButton}
      >
        <Ionicons name="home" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.drawerButtonText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        style={styles.drawerButton}
      >
        <Ionicons name="person" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.drawerButtonText}>Profile</Text>
      </TouchableOpacity>

      {/* Logout button at the bottom */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons
          name="log-out"
          size={24}
          color="#fff"
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    marginTop: 20,
    alignItems: "flex-start",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  userInfo: {
    marginLeft: 10, // Move name and email to the right
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#777",
  },
  userInfoBorder: {
    width: "100%",
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 20,
  },
  drawerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  drawerButtonText: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 18,
  },
  icon: { marginRight: 10, color: "#2196F3" },
  logoutIcon: {
    color: "#f44336",
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    marginTop: "auto", // Pushes logout button to the bottom
  },
  logoutText: {
    color: "#f44336",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 18,
  },
});

export default CustomDrawerContent;
