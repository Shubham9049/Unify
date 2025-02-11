import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { setProfileImage } from "../../redux/profileSlice"; // Adjust the import path for your slice
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


// Section Data
const sections = [
  { name: "Dashboard", icon: "view-dashboard" },
  { name: "Leads", icon: "account-multiple" },
  { name: "University Leads", icon: "school" },
  { name: "Applications", icon: "file-document" },
  { name: "Campaigns", icon: "bullhorn" },
  { name: "Email/Notifications", icon: "email" },
  { name: "Cron Emailer", icon: "clock" },
  { name: "Users", icon: "account-group" },
  { name: "Queries", icon: "comment-question" },
  { name: "Campus Visit", icon: "map-marker" },
  { name: "Refer Friends", icon: "gift" },
];  

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
    { name: "Leads", icon: "person-add", route: "LeadsScreen" },
    { name: "University Leads", icon: "school", route: "UniversityLeadsScreen" },
    { name: "Applications", icon: "file-tray-full", route: "ApplicationsScreen" },
    { name: "Campaigns", icon: "megaphone", route: "CampaignsScreen" },
    { name: "Email/Notifications", icon: "mail", route: "NotificationsScreen" },
    { name: "Cron Emailer", icon: "timer", route: "CronEmailerScreen" },
    { name: "Users", icon: "people", route: "UsersScreen" },
    { name: "Queries", icon: "help-circle", route: "QueriesScreen" },
    { name: "Campus Visit Request", icon: "location", route: "CampusVisitScreen" },
    { name: "Refer Friends", icon: "gift", route: "ReferFriendsScreen" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://bigwigmedia.ai/assets/bigwig-img-pvLFkfcL.jpg",
          }}
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
        <Icon name={section.icon} size={30} color="#fff" />
      </View>
      <Text style={styles.sectionText}>{section.name}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#007bff",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  sectionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
