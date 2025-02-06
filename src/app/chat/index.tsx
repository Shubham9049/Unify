import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

const API_URL = "https://app-database.onrender.com/user";
const Chat = () => {
  const {user}=useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

// Fetch current user's email from AsyncStorage
const fetchUserData = async () => {
  try {
    const email = await AsyncStorage.getItem("email")||user?.primaryEmailAddress?.emailAddress;
    if (email) {
      const response = await axios.get(`${API_URL}/userdata/${email}`);
      setCurrentUser(response.data);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Fetch all users from the backend, excluding the current user
const fetchUsers = async (currentUserData?: any) => {
  try {
    const response = await axios.get(API_URL);
    const allUsers = response.data || [];

    if (currentUserData) {
      const filteredUsers = allUsers.filter(
        (user: any) => user.email !== currentUserData.email
      );
      setUsers(filteredUsers);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    setLoading(false);
  }
};

// Fetch data when the component mounts
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    await fetchUserData();
  };
  loadData();
}, []);

// Fetch users when currentUser is set
useEffect(() => {
  if (currentUser) {
    fetchUsers(currentUser);
  }
}, [currentUser]);

  // Navigate to chatScreen.tsx with selected user
  const handleUserPress = (selectedUser: any) => {
    router.push({
      pathname: "/chat/chat-screen",
      params: { users: JSON.stringify(selectedUser) }, // Pass user data as string
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