import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Using Expo vector icons
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { Link } from "expo-router";
import { useOAuth, useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  // Add Facebook OAuth hook
  const { startOAuthFlow: startFacebookOAuthFlow } = useOAuth({
    strategy: "oauth_facebook",
  });

  // Check if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        router.push("/(main)");
      } else {
        router.push("/(auth)");
      }
    };

    checkAuth();
  }, []);

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({
          redirectUrl: Linking.createURL("/(main)", { scheme: "myapp" }),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // Use signIn or signUp returned from startOAuthFlow
        // for next steps, such as MFA
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  // Facebook login handler
  const onPressFacebook = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startFacebookOAuthFlow({
          redirectUrl: Linking.createURL("/(main)", { scheme: "myapp" }),
        });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      } else {
        // Handle signIn or signUp logic
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  const validateInputs = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters long";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "https://app-database.onrender.com/user/login",
        { email, password }
      );

      const data = response.data;

      if (data.status === "ok") {
        // Store the token in Async Storage
        await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem("username", data.user.username);
        await AsyncStorage.setItem("email", data.user.email);
        await AsyncStorage.setItem("profileImage", data.user.image);
        await AsyncStorage.setItem("mongoId", data.user._id);
        // Navigate to the main screen
        console.log(data.user._id);
        router.push("/(main)");
      } else {
        alert(data.msg || "Login failed");
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
      behavior={Platform.OS === "ios" ? "position" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Blue Section */}
          <View style={styles.topBackground}>
            {/* Logo */}
            <Image
              source={require("../../assets/images/logo.png")} // Replace with your logo URL
              style={styles.logo}
            />
          </View>

          {/* Bottom Gray Section */}
          <View style={styles.bottomSection}>
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>Login Account</Text>

              {/* Email Input */}
              <TextInput
                placeholder="User Name or E-mail"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              {/* Password Input */}
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity onPress={handleLogin} style={styles.button}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>LOGIN</Text>
                )}
              </TouchableOpacity>

              {/* Social Login */}
              <View style={styles.socialLoginContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <AntDesign
                    name="google"
                    size={24}
                    color="red"
                    onPress={onPress}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <FontAwesome
                    name="facebook"
                    size={24}
                    color="blue"
                    onPress={onPressFacebook}
                  />
                </TouchableOpacity>
              </View>

              {/* Register Section */}
              <View style={styles.registrationContainer}>
                <Text style={styles.registrationText}>
                  Don't have an account?
                </Text>
                <TouchableOpacity>
                  <Text
                    style={styles.registerLink}
                    onPress={() => router.push("/(auth)/register")}
                  >
                    REGISTER
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  topBackground: {
    width: "100%",
    height: "57%", // 2/3 of the screen
    backgroundColor: "#007BFF",
    borderBottomLeftRadius: 50, // Large border radius for rounded effect
    borderBottomRightRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    position: "absolute",
    top: 40,
    width: 140,
    height: 140,
    resizeMode: "contain",
    borderRadius: 70,
  },
  bottomSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginCard: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    alignItems: "center",
    position: "absolute",
    top: "-18%", // Moves the login card upwards
    transform: [{ translateY: -50 }],
    marginTop: -30,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  iconContainer: {
    position: "absolute",
    right: 15,
    top: 10,
  },
  forgotPasswordText: {
    alignSelf: "flex-end",
    color: "#007BFF",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginVertical: 10,
  },
  socialButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  registrationContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  registrationText: {
    fontSize: 14,
    color: "#555",
  },
  registerLink: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default Index;
