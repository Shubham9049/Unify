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
      const response = await fetch(
        "https://app-database.onrender.com/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.status === "ok") {
        // Store the token in Async Storage
        await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem("username", data.user.username);
        await AsyncStorage.setItem("email", data.user.email);
        await AsyncStorage.setItem("profileImage", data.user.image);
        await AsyncStorage.setItem("mongoId", data.user._id)
        console.log(data.user._id)
        // Navigate to the main screen
        router.push("/(main)");
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false); // Stop loading after the login attempt
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* UI Components */}
      <Image
        source={{
          uri: "https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg",
        }}
        style={styles.logo}
      />
      <TextInput
        placeholder="Email"
        style={[styles.input, errors.email ? styles.inputError : null]}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email ? (
        <Text style={styles.errorText}>{errors.email}</Text>
      ) : null}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          style={[styles.input, errors.password ? styles.inputError : null]}
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
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}
      <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
        <Text style={styles.forgotPasswordText}>Forgot/Reset Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      <View style={styles.registrationContainer}>
        <Text style={styles.registrationText}>Don't have an account?</Text>
        <TouchableOpacity>
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/(auth)/register")}
          >
            Register
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button2} onPress={onPress}>
        <AntDesign name="google" size={24} color="red" />
        <Text style={styles.Social_buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button2, styles.facebookButton]}
        onPress={onPressFacebook}
      >
        <FontAwesome name="facebook" size={24} color="blue" />
        <Text style={styles.Social_buttonText}>Sign in with Facebook</Text>
      </TouchableOpacity>
      {/* <Button title="Sign in with Facebook" onPress={onPressFacebook} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  passwordContainer: {
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  forgotPasswordText: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 10,
  },
  registrationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registrationText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 15,
  },
  registerLink: {
    color: "#007bff",
    fontSize: 14,
  },
  Social_buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  facebookButton: {
    backgroundColor: "#3b5998", // Facebook Blue
  },
  button2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4", // Google Blue
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: "100%",
  },
});

export default Index;
function startFacebookOAuthFlow(arg0: { redirectUrl: string }):
  | { createdSessionId: any; signIn: any; signUp: any; setActive: any }
  | PromiseLike<{
      createdSessionId: any;
      signIn: any;
      signUp: any;
      setActive: any;
    }> {
  throw new Error("Function not implemented.");
}
function useFacebookOAuth(): { startOAuthFlow: any } {
  throw new Error("Function not implemented.");
}
