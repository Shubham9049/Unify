import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

export default function Profile() {
  const [storedUserData, setStoredUserData] = useState({
    username: "Guest",
    email: "No email found",
  });

  const { profileImage } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        const email = await AsyncStorage.getItem("email");

        setStoredUserData({
          username: username || "Guest",
          email: email || "No email found",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const userName = storedUserData.username;
  const userEmail =  storedUserData.email;
  const displayImage =  profileImage || null;
  const profileInitial = userName.charAt(0).toUpperCase();

  return (
    <LinearGradient colors={["#16222A", "#3A6073"]} style={styles.container}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>{profileInitial}</Text>
          </View>
        )}
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* User Info */}
      <Text style={styles.userName}>{userName}</Text>
      <Text style={styles.userEmail}>{userEmail}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1E1E1E", // Your primary background color
    paddingHorizontal: 20,
    justifyContent: "flex-start",
    paddingTop: height * 0.05, // Adjust top padding dynamically
  },
  imageContainer: {
    height: height * 0.33, // 1/3 of screen height
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: height * 0.2,
    height: height * 0.2,
    borderRadius: height * 0.1,
    borderWidth: 3,
    borderColor: "#FFB100", // Your primary highlight color
  },
  profilePlaceholder: {
    width: height * 0.2,
    height: height * 0.2,
    borderRadius: height * 0.1,
    backgroundColor: "#FFB100", // Your primary color
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitial: {
    fontSize: height * 0.08,
    color: "#FFF",
    fontWeight: "bold",
  },
  separator: {
    width: "80%",
    height: 2,
    backgroundColor: "#444", // Subtle separator color
    marginVertical: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#BBB", // Light grey for better contrast
    marginTop: 5,
  },
});
