import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";

export default function Profile() {
  const { user } = useUser();
  const { userId } = useAuth();
  const [storedUserData, setStoredUserData] = useState({
    username: "Guest",
    email: "No email found",
  });
    const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        const email = await AsyncStorage.getItem("email");
        const image = await AsyncStorage.getItem("profileImage");

        setStoredUserData({
          username: username || "Guest",
          email: email || "No email found",
        });
        setProfileImage(image);

        if (userId) {
          // Fetch additional user data from backend if logged in via email & password
          const response = await axios.get(`https://your-backend.com/user/${userId}`);
          if (response.data) {
            setStoredUserData({
              username: response.data.username || username || "Guest",
              email: response.data.email || email || "No email found",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleProfileImageChange = async () => {
    if (user?.imageUrl) return; // Google/Facebook users cannot change their image
  
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access photos.");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setStoredUserData((prev) => ({ ...prev, image: selectedImage }));
  
      try {
        // Convert image URI to Blob
        const response = await fetch(selectedImage);
        const blob = await response.blob();
  
        const formData = new FormData();
        formData.append("image", blob, "profile.jpg"); // Correct format
  
        await axios.post(
          `https://app-database.onrender.com/user/${userId}/upload-image`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
  
        await AsyncStorage.setItem("profileImage", selectedImage);
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    }
  };
  

  const userName = user?.fullName || storedUserData.username;
  const userEmail = user?.primaryEmailAddress?.emailAddress || storedUserData.email;
  const isGoogleOrFacebookUser = Boolean(user?.imageUrl); // Check if user logged in via Google/Facebook

  const displayImage =
  user?.imageUrl ||
  (profileImage ? `https://app-database.onrender.com${profileImage}` : null);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        {/* Display user image if available, otherwise show first letter of name */}
       {displayImage ? (
                 <Image source={{ uri: displayImage }} style={styles.profileImage} />
               ) : (
                 <View style={styles.profilePlaceholder}>
                   <Text style={styles.profileInitial}>
                     {userName.charAt(0).toUpperCase()}
                   </Text>
                 </View>
               )}

        {!isGoogleOrFacebookUser && (
          <TouchableOpacity onPress={handleProfileImageChange} style={styles.changeImageButton}>
            <Text style={styles.changeImageText}>Change Profile Image</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileInitial: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  changeImageButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  userPhone: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
});
