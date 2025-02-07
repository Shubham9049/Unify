import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { setProfileImage } from "../../redux/profileSlice"; // Adjust the import path for your slice

export default function App() {
  const { userId } = useAuth();
  const { user } = useUser();
  const navigation = useNavigation();

  // Redux state
  const dispatch = useDispatch();
  const profileImage = useSelector((state: any) => state.profile.profileImage);
  const [authToken, setAuthToken] = useState("");
  const [storedUsername, setStoredUsername] = useState("");

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem("authToken", userId);
        }
        const token = await AsyncStorage.getItem("authToken");
        const username = await AsyncStorage.getItem("username");
        const image = await AsyncStorage.getItem("profileImage");

        setAuthToken(token || "No token found");
        setStoredUsername(username || "Guest");

        // Check if profile image exists in AsyncStorage and update Redux state
        if (image) {
          dispatch(setProfileImage(image));
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, [userId, dispatch]);

  const userName = user?.fullName || storedUsername;
  const displayImage = user?.imageUrl || profileImage || null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg",
          }}
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text
        style={{
          flex: 1,
          fontSize: 30,
          textAlign: "center",
          marginTop: 30,
        }}
      >
        Welcome
      </Text>
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
  profileContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
