import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]); // State for 6 digit code
  const [loading, setLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false); // To show/hide OTP input and verify button

  // Create refs for the code inputs
  const codeRefs = useRef<(TextInput | null)[]>([]);

  // Handle Forgot Password (send OTP)
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://app-database.onrender.com/user/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (data.status === "ok") {
        Alert.alert("Success", "Password reset code sent to your email.");
        setIsCodeSent(true); // Show OTP input and verify button
        await AsyncStorage.setItem("email", email); // Store email in AsyncStorage
      } else {
        Alert.alert("Error", data.msg || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Code Verification
  const handleVerifyCode = async () => {
    const codeString = code.join(""); // Combine the code array into a single string

    if (codeString.length !== 6) {
      Alert.alert("Error", "Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://app-database.onrender.com/user/verify-reset-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email, // Send email for verification
            resetCode: codeString, // Send the 6-digit code
          }),
        }
      );

      const data = await response.json();
      if (data.status === "ok") {
        Alert.alert("Success", "Code verified successfully!");
        router.push("/(auth)/reset-password"); // Move to the reset password section
      } else {
        Alert.alert("Error", data.msg || "Failed to verify code");
      }
    } catch (error) {
      console.error("Verify Code Error:", error);
      Alert.alert("Error", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle individual code input
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text; // Update the specific index
    setCode(newCode);

    // Automatically focus the next input when the current one is filled
    if (text.length === 1 && index < 5) {
      // Focus the next input field
      codeRefs.current[index + 1]?.focus();
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

            {/* Email Input & OTP Send */}
            {!isCodeSent && (
              <View style={styles.formContainer}>
                <Text style={styles.title}>Forgot Password</Text>

                {/* Email Input */}
                <TextInput
                  placeholder="Enter your email"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* Send OTP Button */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.button}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* OTP Input */}
            {isCodeSent && (
              <View style={styles.formContainer}>
                <Text style={styles.title}>Enter OTP</Text>

                {/* OTP Code Inputs */}
                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.codeInput}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      ref={(ref) => (codeRefs.current[index] = ref)} // Assign ref to each input
                    />
                  ))}
                </View>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  onPress={handleVerifyCode}
                  style={styles.button}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
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
    height: "60%",
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
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
    marginBottom: 10,
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  codeInput: {
    width: "15%",
    padding: 12,
    backgroundColor: "#F3F3F3",
    textAlign: "center",
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
  },
});

export default ForgotPassword;
