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
  Dimensions,
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
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const loginScreen = () => {
  const [email, setEmail] = useState("");
  const [empid, setEmpid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ empid: "", password: "" });
  const [loading, setLoading] = useState(false);

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
        router.push("/(auth)/loginScreen");
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

  // const validateInputs = () => {
  //   let valid = true;
  //   const newErrors = { empid: "", password: "" };

  //   if (!empid.trim()) {
  //     newErrors.empid = "Email is required";
  //     valid = false;
  //   } else if (!/\S+@\S+\.\S+/.test(email)) {
  //     newErrors.empid = "Invalid email format";
  //     valid = false;
  //   }

  //   if (!password.trim()) {
  //     newErrors.password = "Password is required";
  //     valid = false;
  //   } else if (password.length < 4) {
  //     newErrors.password = "Password must be at least 4 characters long";
  //     valid = false;
  //   }

  //   setErrors(newErrors);
  //   return valid;
  // };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://app.bigwigmedia.in/LoginApi.php",
        { empid, password }
      );

      const data = response.data;
      console.log(data);

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

  function uri(
    arg0: string
  ): import("react-native").ImageSourcePropType | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
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
              {errors.empid && (
                <Text style={styles.errorText}>{errors.empid}</Text>
              )}
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              {/* Remember Me & Forgot Password */}
              {/* <View style={styles.forgotContainer}>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View> */}

              {/* Login Button with Gradient */}
              <TouchableOpacity onPress={handleLogin}>
                <LinearGradient
                  colors={["#3A5BA9", "#08215e"]}
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

              {/* Social Login */}
              {/* <View style={styles.socialLoginContainer}>
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
              </View> */}

              {/* Sign Up */}
              {/* <Text style={styles.registerText}>
                Don't have an account?{" "}
                <Text
                  onPress={() => router.push("/(auth)/register")}
                  style={styles.registerLink}
                >
                  Sign up
                </Text>
              </Text> */}
            </View>
          </View>
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
    backgroundColor: "#3A5BA9",
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
  forgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  forgotText: {
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
  registerText: {
    color: "white",
  },
  registerLink: {
    color: "#FF512F",
    fontWeight: "bold",
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  socialButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 25,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
  },
});

export default loginScreen;
