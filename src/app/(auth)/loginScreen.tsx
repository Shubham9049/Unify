import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ScrollView,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Using Expo vector icons
import { router } from "expo-router";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const loginScreen = () => {
  const [empid, setEmpid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        router.push("/(main)");
      } else {
        router.push("/(auth)/loginScreen");
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://app.bigwigmedia.in/LoginApi.php",
        { empid, password }
      );

      const data = response.data;

      if (data.userInfo && data.userInfo.status === 1) {
        // Store the token in Async Storage
        await AsyncStorage.setItem("username", data.userInfo.name);
        await AsyncStorage.setItem("email", data.userInfo.email);
        // Navigate to the main screen
        router.push("/(main)");
      } else {
        alert(data.error || "Login failed"); // Show error message from API
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <LinearGradient colors={["#16222A", "#3A6073"]} style={styles.container}>
            {/* Top Section with Illustration */}
            <View style={styles.topContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.topImage}
              />
            </View>

            {/* Login Content */}
            <View style={styles.content}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to your account</Text>

              {/* Username Field with Gradient */}
              <LinearGradient
                colors={["#9ba5bd", "#7487b5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.inputContainer}
              >
                <Ionicons name="mail-outline" size={20} color="white" />
                <TextInput
                  placeholder="Email"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={empid}
                  onChangeText={setEmpid}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
              </LinearGradient>
              
              {/* Password Field with Gradient */}
              <LinearGradient
                colors={["#9ba5bd", "#7487b5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.inputContainer}
              >
                <Ionicons name="lock-closed-outline" size={20} color="white" />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              </LinearGradient>
             

              {/* Login Button with Gradient */}
              <TouchableOpacity onPress={handleLogin}>
                <LinearGradient
                  colors={["#16222A", "#3A6073","gray"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>LOGIN</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </LinearGradient>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F3B8C",
    alignItems: "center",
  },
  topContainer: {
    width: "100%",
    height: height * 0.25,
    backgroundColor: "#3A6073",
    borderBottomLeftRadius: "50%",
    borderBottomRightRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
  },
  topImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  content: {
    width: width * 0.85,
    alignItems: "center",
    marginTop: -20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "white",
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: width * 0.85,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

});

export default loginScreen;
