import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

const API_URL = "https://app-database.onrender.com/user";
const CHAT_API_URL = "https://app-database.onrender.com/chat"; // ✅ Added chat API base URL

const Chat = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<{
    [key: string]: number;
  }>({});

  // Fetch current user's email from AsyncStorage
  const fetchUserData = async () => {
    try {
      const email =
        (await AsyncStorage.getItem("email")) ||
        user?.primaryEmailAddress?.emailAddress;
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

        // Fetch unread messages count for each user
        const unreadCounts: { [key: string]: number } = {};
        for (const user of filteredUsers) {
          const countRes = await axios.get(
            `${CHAT_API_URL}/unread-messages?receiverId=${currentUserData._id}&senderId=${user._id}`
          );
          unreadCounts[user._id] = countRes.data.unreadCount || 0;
        }
        setUnreadMessages(unreadCounts);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
  }, [currentUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
  };

  // Navigate to chatScreen.tsx and mark messages as read
  const handleUserPress = async (selectedUser: any) => {
    // Reset unread count for this chat
    setUnreadMessages((prev) => ({ ...prev, [selectedUser._id]: 0 }));

    // ✅ Mark messages as read in the backend
    await axios.post(`${CHAT_API_URL}/mark-as-read`, {
      receiverId: currentUser._id,
      senderId: selectedUser._id,
    });

    router.push({
      pathname: "/chat/chat-screen",
      params: { users: JSON.stringify(selectedUser) },
    });
  };

  // Render user item
  const renderUser = ({ item }: any) => (
    <TouchableOpacity
      style={styles.userContainer}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.user_img_text}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/50" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.username}</Text>
      </View>

      {/* Unread message count badge */}
      {unreadMessages[item._id] > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unreadMessages[item._id]}</Text>
        </View>
      )}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    justifyContent: "space-between",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "bold" },
  user_img_text: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    // position: "absolute",
    // right: 15,
    // top: 22,
    backgroundColor: "red",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});
