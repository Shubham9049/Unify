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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // For icons
import { router } from "expo-router";
import axios from "axios";

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
            {/* Logo Section */}
            <View style={styles.topBackground}>
              <Image
                source={{
                  uri: "https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg",
                }}
                style={styles.logo}
              />
            </View>

            {/* Registration Form */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Account</Text>

              {/* Username Input */}
              <TextInput
                placeholder="Username"
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleChange("username", value)}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}

              {/* Email Input */}
              <TextInput
                placeholder="Email"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Password Input with Show/Hide */}
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry={!passwordVisible}
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
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
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                style={styles.registerButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Already have an account section */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)")}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
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
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 8,
    width: "100%",
  },
  iconContainer: {
    position: "absolute",
    right: 15,
  },
  registerButton: {
    width: "100%",
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: "#007BFF",
    fontWeight: "bold",
    marginLeft: 5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
  },
});

export default Register;
