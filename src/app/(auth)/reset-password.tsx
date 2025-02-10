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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router"; // Import the router for navigation
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { Ionicons } from "@expo/vector-icons"; // Import icons from expo/vector-icons

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
        router.push("/(auth)"); // Navigate to login page after successful password reset
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
      behavior={Platform.OS === "ios" ? "position" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView style={styles.container}>
            {/* Logo Section */}
            <View style={styles.topBackground}>
              <Image
                source={{
                  uri: "https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg",
                }}
                style={styles.logo}
              />
            </View>

            {/* Reset Password Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Reset Your Password</Text>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Enter your new password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Confirm your new password"
                  style={styles.input}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={24}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                onPress={handleResetPassword}
                style={styles.button}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    "Reset Password"
                  )}
                </Text>
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
    backgroundColor: "#F9F9F9",
    alignItems: "center",
  },
  topBackground: {
    width: "100%",
    height: "60%", // Adjusted height to fit logo properly
    backgroundColor: "#007BFF",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 170,
    height: 170,
    resizeMode: "contain",
    borderRadius: 70,
    position: "absolute",
    top: 40,
  },
  formContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    alignItems: "center",
    marginTop: -120, // Adjusted to avoid overlap
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    width: "100%",
    marginBottom: 15,
  },
  input: {
    width: "90%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
  },
  iconContainer: {
    position: "absolute",
    right: 15,
  },
  button: {
    width: "100%",
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ResetPassword;
