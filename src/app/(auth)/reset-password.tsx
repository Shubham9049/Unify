import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router"; // Import the router for navigation
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Ionicons } from "@expo/vector-icons"; // Import icons from expo/vector-icons
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const ResetPassword = () => {
  const [email, setEmail] = useState(""); // State to hold the email
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle for new password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password visibility
  const [loading, setLoading] = useState(false);

  // Retrieve email from AsyncStorage when the component mounts
  useEffect(() => {
    const getEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        if (storedEmail) {
          setEmail(storedEmail); // Set the email in state
        }
      } catch (error) {
        console.error("Error retrieving email from AsyncStorage:", error);
      }
    };
    getEmail();
  }, []);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://app-database.onrender.com/user/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email, // Send email for verification
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "ok") {
        Alert.alert("Success", "Password reset successfully!");
        router.push("/(auth)/loginScreen"); // Navigate to login page after successful password reset
      } else {
        Alert.alert("Error", data.msg || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      Alert.alert("Error", "Something went wrong. Try again.");
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView style={styles.container}>
            {/* Top Section */}
            <View style={styles.topContainer}>
              <Image
                source={{
                  uri: "https://cdni.iconscout.com/illustration/premium/thumb/account-login-protection-illustration-download-in-svg-png-gif-file-formats--security-secure-pack-files-folders-illustrations-7271014.png",
                }}
                style={styles.logo}
              />
            </View>

            {/* Reset Password Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Reset Your Password</Text>
              <Text style={styles.subtitle}>
                Enter a new password for your account
              </Text>

              {/* New Password Input */}
              <LinearGradient
                colors={["#9ba5bd", "#7487b5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.inputContainer}
              >
                <TextInput
                  placeholder="Enter your new password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </LinearGradient>

              {/* Confirm Password Input */}
              <LinearGradient
                colors={["#9ba5bd", "#7487b5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.inputContainer}
              >
                <TextInput
                  placeholder="Confirm your new password"
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </LinearGradient>

              {/* Reset Password Button */}

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#3A5BA9", "#08215e"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
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
    width: width,
    height: height * 0.3,
    backgroundColor: "#3A5BA9",
    borderBottomLeftRadius: "50%",
    borderBottomRightRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100,
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  formContainer: {
    width: width * 0.85,
    alignItems: "center",
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
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    padding: 15,
    color: "white",
  },
  button: {
    width: width * 0.85,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ResetPassword;
