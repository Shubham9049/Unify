import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = "https://app-database.onrender.com/user";
const Chat = ({ navigation }: any) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user's email from AsyncStorage and user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Retrieve email from AsyncStorage
        const email = await AsyncStorage.getItem("email");

        if (email) {
          // Fetch user data from the backend using email
          const response = await axios.get(`${API_URL}/userdata/${email}`);
          setCurrentUser(response.data); // Set the current user data
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch all users from the backend, excluding the current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(API_URL);
        const allUsers = response.data || [];

        // Filter out the logged-in user
        if (currentUser) {
          const filteredUsers = allUsers.filter(
            (user: any) => user.email !== currentUser.email
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Navigate to chatScreen.tsx with selected user
  const handleUserPress = (selectedUser: any) => {
    router.push({
      pathname: "/chatScreen",
      params: { user: JSON.stringify(selectedUser) }, // Pass user data as string
    });
  };

  // Render user item
  const renderUser = ({ item }: any) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => handleUserPress(item)}
    >
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/50" }}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a User to Chat</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item: any) => item._id}
          renderItem={renderUser}
        />
      )}
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "bold" },
});