import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { setProfileImage } from "../../redux/profileSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function App() {
  const { userId } = useAuth();
  const { user } = useUser();
  const navigation = useNavigation();

  // Redux state
  const dispatch = useDispatch();
  const profileImage = useSelector((state: any) => state.profile.profileImage);
  const [authToken, setAuthToken] = useState("");
  const [storedUsername, setStoredUsername] = useState("");
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  // Inside your useEffect or component
  useEffect(() => {
    // This listener will be triggered when the user taps on the notification
    const notificationListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data.screen === "chat") {
          // Navigate to the chat screen with the appropriate user or chat data
          router.push(`/(main)/chat`);
        }
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, [navigation]);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem("authToken", userId);
        }
        const token = await AsyncStorage.getItem("authToken");
        const username = await AsyncStorage.getItem("username");
        const image = await AsyncStorage.getItem("profileImage");
        let savedEmail = await AsyncStorage.getItem("email");
        const clerkEmail = user?.primaryEmailAddress?.emailAddress;

        // ✅ Ensure email is never null or undefined
        if (!savedEmail && clerkEmail) {
          await AsyncStorage.setItem("email", clerkEmail);
          savedEmail = clerkEmail;
        }

        setAuthToken(token || "No token found");
        setStoredUsername(username || "Guest");
        setEmail(savedEmail || "Unknown"); // ✅ Default value if email is missing

        if (image) {
          dispatch(setProfileImage(image));
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, [userId, dispatch]); // ✅ Removed extra `useEffect`

  // ✅ New useEffect to register push notifications only after email is set
  useEffect(() => {
    if (email) {
      registerForPushNotificationsAsync();
    }
  }, [email]);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notifications!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);

      // ✅ Get user's email from AsyncStorage or Clerk
      const userEmail = email;
      if (!userEmail) {
        console.warn("❌ No email found. Push token not sent.");
        return;
      }
      console.log(userEmail);

      // ✅ Send token and email to backend API
      try {
        const response = await fetch(
          "https://app-database.onrender.com/user/save-token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, pushToken: token }),
          }
        );

        const result = await response.json();
        if (result.success) {
          console.log("✅ Push token successfully saved to backend.");
        } else {
          console.warn("⚠️ Failed to save push token:", result.message);
        }
      } catch (error) {
        console.error("❌ Error sending push token:", error);
      }
    } else {
      alert("Must use a physical device for push notifications!");
    }
    return token;
  }

  const userName = user?.fullName || storedUsername;
  const displayImage = user?.imageUrl || profileImage || null;
  const sections = [
    { name: "Dashboard", icon: "home", route: "Dashboard" },
    { name: "Leads", icon: "account-plus", route: "LeadsScreen" },
    {
      name: "University Leads",
      icon: "school",
      route: "UniversityLeadsScreen",
    },
    {
      name: "Applications",
      icon: "file-document",
      route: "ApplicationsScreen",
    },
    { name: "Campaigns", icon: "bullhorn", route: "CampaignsScreen" },
    { name: "Email/Notifications", icon: "mail", route: "NotificationsScreen" },
    { name: "Cron Emailer", icon: "timer", route: "CronEmailerScreen" },
    { name: "Users", icon: "account-multiple", route: "UsersScreen" },
    { name: "Queries", icon: "help-circle", route: "QueriesScreen" },
    {
      name: "Campus Visit Request",
      icon: "store-marker-outline",
      route: "CampusVisitScreen",
    },
    { name: "Refer Friends", icon: "gift", route: "ReferFriendsScreen" },
  ];

  return (
    <LinearGradient
      colors={["#0F2027", "#203A43", "#2C5364"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.sectionContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={styles.section}
            onPress={() => router.push(`/(main)/${section.route}` as any)}
          >
            <View style={styles.iconCircle}>
              <Icon
                name={section.icon}
                size={30}
                color="#fff"
                style={styles.icon3D}
              />
            </View>
            <Text style={styles.sectionText}>{section.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#26569e",
    marginTop: 15,
    marginHorizontal: 10,
    borderRadius: 28,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 25,
  },
  profileContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  sectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingTop: 45,
  },
  section: {
    alignItems: "center",
    width: "30%",
    marginVertical: 15,
  },
  iconCircle: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#00ffff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  icon3D: {
    textShadowColor: "rgba(0, 0, 255, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  sectionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#ffff",
    textAlign: "center",
  },
});
