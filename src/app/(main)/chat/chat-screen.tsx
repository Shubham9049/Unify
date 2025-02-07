import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { io } from "socket.io-client";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@clerk/clerk-expo";

const socket = io("https://app-database.onrender.com");

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string;
}

const ChatScreen = () => {
  const { users } = useLocalSearchParams();
  const { user } = useUser();
  const selectedUser =
    users && typeof users === "string" ? JSON.parse(users) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Move useRef inside the function component
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email =
          (await AsyncStorage.getItem("email")) ||
          user?.primaryEmailAddress?.emailAddress;

        if (email) {
          const response = await axios.get(
            `https://app-database.onrender.com/user/userdata/${email}`
          );
          setUserId(response.data._id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userId || !selectedUser) return;
    const fetchMessages = async () => {
      try {
        const response = await axios.get<{ messages: Message[] }>(
          `https://app-database.onrender.com/chat/messages/${selectedUser._id}?senderId=${userId}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [userId, selectedUser]);

  useEffect(() => {
    socket.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);

      // ✅ Scroll to bottom when a new message is received
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !selectedUser || !userId) return;

    const messageData: Message = {
      _id: Date.now().toString(),
      senderId: userId,
      receiverId: selectedUser._id,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);

    // ✅ Scroll to bottom after sending a message
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await axios.post(
        "https://app-database.onrender.com/chat/send",
        messageData
      );
    } catch (error) {
      console.error("Error sending message to backend:", error);
    }

    setNewMessage("");
  };

  const deleteMessage = async (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await axios.delete(
                `https://app-database.onrender.com/chat/delete/${messageId}`,
                { data: { userId } }
              );

              if (response.data.success) {
                setMessages((prevMessages) =>
                  prevMessages.filter((msg) => msg._id !== messageId)
                );
              }
            } catch (error) {
              console.error("Error deleting message:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const getInitials = (name: string | undefined) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {selectedUser?.image ? (
          <Image
            source={{ uri: selectedUser.image }}
            style={styles.userImage}
          />
        ) : user?.imageUrl ? (
          <Image source={{ uri: user.imageUrl }} style={styles.userImage} />
        ) : (
          <View style={styles.userInitials}>
            <Text style={styles.initialsText}>
              {getInitials(selectedUser?.username)}
            </Text>
          </View>
        )}
        <Text style={styles.header}>
          {selectedUser?.username || "Unknown User"}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg) => (
          <Pressable
            key={msg._id}
            onLongPress={() => deleteMessage(msg._id)}
            style={
              msg.senderId === userId
                ? styles.sentMessage
                : styles.receivedMessage
            }
          >
            <Text style={styles.messageText}>{msg.message}</Text>
            <Text
              style={[
                styles.timestamp,
                msg.senderId === userId
                  ? styles.sentTimestamp
                  : styles.receivedTimestamp,
              ]}
            >
              {msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Invalid Date"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Button
          title="Send"
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 5, backgroundColor: "#f0f0f0" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    marginTop: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  defaultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  messagesContainer: { flex: 1, padding: 10, marginBottom: 10 },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  sentTimestamp: {
    fontSize: 12,
    color: "#D1E8FF", // Light blue color for sender's timestamp
    marginTop: 5,
    alignSelf: "flex-end",
  },

  receivedTimestamp: {
    fontSize: 12,
    color: "#666", // Darker grey for received messages timestamp
    marginTop: 5,
    alignSelf: "flex-start",
  },
  userInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0084ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  initialsText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0084ff",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: "70%",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e5e5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: "70%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 10,
  },
  messageText: {
    // flex: 1,
  },
});
