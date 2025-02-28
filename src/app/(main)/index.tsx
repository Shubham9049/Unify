import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { setProfileImage } from "../../redux/profileSlice"; // Adjust the import path for your slice
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const { userId } = useAuth();
  const { user } = useUser();
  const navigation = useNavigation();

  // Redux state
  const dispatch = useDispatch();
  const profileImage = useSelector((state: any) => state.profile.profileImage);
  const [authToken, setAuthToken] = useState("");
  const [storedUsername, setStoredUsername] = useState("");

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (userId) {
          await AsyncStorage.setItem("authToken", userId);
        }
        const token = await AsyncStorage.getItem("authToken");
        const username = await AsyncStorage.getItem("username");
        const image = await AsyncStorage.getItem("profileImage");

        setAuthToken(token || "No token found");
        setStoredUsername(username || "Guest");

        // Check if profile image exists in AsyncStorage and update Redux state
        if (image) {
          dispatch(setProfileImage(image));
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };

    fetchAuthData();
  }, [userId, dispatch]);

  const userName = user?.fullName || storedUsername;
  const displayImage = user?.imageUrl || profileImage || null;
  const sections = [
    { name: "Dashboard", icon: "home", route: "Dashboard" },
    { name: "Leads", icon: "account-plus", route: "LeadsScreen" },
    {
      name: "Applications",
      icon: "file-document", // Updated from "file-tray-full"
      route: "ApplicationsScreen",
    },
    { name: "Application Review ", icon: "file-check", route: "ApplicationReview" },
    
    { name: "Users", icon: "account-multiple", route: "UsersScreen" },
    { name: "Queries", icon: "help-circle", route: "QueriesScreen" },
    {
      name: "Campus Visit Request",
      icon: "store-marker-outline", // Updated from "location"
      route: "CampusVisitScreen",
    },
    { name: "Refer Friends", icon: "gift", route: "ReferFriendsScreen" },
  ];

  return (
    <LinearGradient
    colors={["#1F3B8C", "#3A5BA9"]}
      style={styles.container}
    >
      {/* Header */}
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

      {/* Sections Grid */}
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
                size={32}
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
