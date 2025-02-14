import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { router } from "expo-router";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { username: "", email: "", password: "" };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
      valid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 6 characters long.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await axios.post(
        "https://app-database.onrender.com/user/signup",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.status === "ok") {
        Alert.alert(
          "Success",
          "Registration successful! Please verify your email to log in."
        );
        router.push("/(auth)");
      } else if (
        response.data &&
        response.data.msg === "User already present"
      ) {
        // Show error message when the email is already registered
        Alert.alert("Error", "User already registered.");
      } else {
        Alert.alert("Error", "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error for the field
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
            {/* Top Section with Illustration */}
            <View style={styles.topContainer}>
              <Image
                source={{
                  uri: "https://cdni.iconscout.com/illustration/premium/thumb/account-login-protection-illustration-download-in-svg-png-gif-file-formats--security-secure-pack-files-folders-illustrations-7271014.png",
                }}
                style={styles.topImage}
              />
            </View>

            {/* Registration Form */}
            <View style={styles.content}>
              <Text style={styles.title}>Create Account</Text>

              {/* Username Input with Gradient */}
              <LinearGradient
                colors={["#9ba5bd", "#7487b5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.inputContainer}
              >
                <Ionicons name="person-outline" size={20} color="white" />
                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(value) => handleChange("username", value)}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
              </LinearGradient>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

              {/* Email Input with Gradient */}
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
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                />
              </LinearGradient>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Input with Gradient */}
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
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
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

              {/* Register Button with Gradient */}
              <TouchableOpacity onPress={handleRegister} disabled={loading}>
                <LinearGradient
                  colors={["#3A5BA9", "#08215e"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.registerButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Already have an account? */}
              <Text style={styles.registerText}>
                Already have an account?{" "}
                <Text
                  onPress={() => router.push("/(auth)/loginScreen")}
                  style={styles.registerLink}
                >
                  Login
                </Text>
              </Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "white",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
  },
  registerButton: {
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
});

export default Register;
