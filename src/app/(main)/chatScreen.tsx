import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { io } from "socket.io-client";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const socket = io("https://app-database.onrender.com");
interface Message {
    senderId: string;
    receiverId: string;
    message: string;
    timestamp?: string;
  }
  
  
  const ChatScreen = () => {
    const { user } = useLocalSearchParams();
    const selectedUser = user && typeof user === "string" ? JSON.parse(user) : null;
  
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [token, setToken]=useState<string>("")

    useEffect(() => {
        const fetchToken = async () => {
          try {
            const authtoken = await AsyncStorage.getItem("authToken");
            console.log(authtoken)
            if (authtoken) {
              setToken(authtoken);
            }
          } catch (error) {
            console.error("Error fetching token", error);
          }
        };
    
        fetchToken();
      }, []);
  
    useEffect(() => {
      const fetchMessages = async () => {
        if (!selectedUser) return;
        try {
          const response = await axios.get<{ messages: Message[] }>(
            `https://app-database.onrender.com/chat/messages/${selectedUser._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMessages(response.data.messages);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
  
      fetchMessages();
    }, [selectedUser]);
  
    useEffect(() => {
      socket.on("newMessage", (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
  
      return () => {
        socket.off("newMessage");
      };
    }, []);
  
    const sendMessage = () => {
      if (newMessage.trim() === "" || !selectedUser) return;
  
      const messageData: Message = {
        senderId: "YOUR_USER_ID", // Replace with actual user ID
        receiverId: selectedUser.id,
        message: newMessage,
      };
  
      socket.emit("sendMessage", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage("");
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.header}>
        {selectedUser?.username || "Unknown User"}
      </Text>
        <ScrollView>
          {messages.map((msg, index) => (
            <Text
              key={index}
              style={msg.senderId === "YOUR_USER_ID" ? styles.sentMessage : styles.receivedMessage}
            >
              {msg.message}
            </Text>
          ))}
        </ScrollView>
  
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            style={styles.input}
          />
          <Button title="Send" onPress={sendMessage} />
        </View>
      </View>
    );
  };
  
  export default ChatScreen;
  
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: "#f0f0f0" },
    header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    sentMessage: {
      alignSelf: "flex-end",
      backgroundColor: "#0084ff",
      color: "#fff",
      padding: 10,
      borderRadius: 10,
      marginBottom: 5,
    },
    receivedMessage: {
      alignSelf: "flex-start",
      backgroundColor: "#e5e5e5",
      padding: 10,
      borderRadius: 10,
      marginBottom: 5,
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
  });
  