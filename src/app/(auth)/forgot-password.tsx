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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

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

            {/* Email Input & OTP Send */}
            {!isCodeSent && (
              <View style={styles.formContainer}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email to receive an OTP
                </Text>

                <LinearGradient
                  colors={["#9ba5bd", "#7487b5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.inputContainer}
                >
                  <TextInput
                    placeholder="Enter your email"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="rgba(255,255,255,0.7)"
                  />
                </LinearGradient>

                <TouchableOpacity
                  onPress={handleForgotPassword}
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
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* OTP Input */}
            {isCodeSent && (
              <View style={styles.formContainer}>
                <Text style={styles.title}>Enter OTP</Text>
                <Text style={styles.subtitle}>
                  Enter the OTP sent to your email
                </Text>

                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.codeInput}
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      ref={(ref) => (codeRefs.current[index] = ref)}
                    />
                  ))}
                </View>

                <TouchableOpacity onPress={handleVerifyCode} disabled={loading}>
                  <LinearGradient
                    colors={["#3A5BA9", "#08215e"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                  </LinearGradient>
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
    marginTop: -40,
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
    width: "100%",
    borderRadius: 10,
    marginBottom: 15,
    padding: 2,
  },
  input: {
    width: "100%",
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "white",
    marginHorizontal: 5,
    borderRadius: 10,
  },
});

export default ForgotPassword;
