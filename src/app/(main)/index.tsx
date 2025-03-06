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
import { DrawerActions } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setProfileImage } from "../../redux/profileSlice";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { BackHandler, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function App() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const profileImage = useSelector((state:any) => state.profile.profileImage);
  const [storedUsername, setStoredUsername] = useState("Guest");

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        const image = await AsyncStorage.getItem("profileImage");
        if (username) setStoredUsername(username);
        if (image) dispatch(setProfileImage(image));
      } catch (error) {
        console.error("Error fetching auth data:", error);
      }
    };
    fetchAuthData();
  }, [dispatch]);

  const sections = [
    { name: "Dashboard", icon: "home", route: "Dashboard" },
    { name: "Leads", icon: "account-plus", route: "LeadsScreen" },
    { name: "Applications", icon: "file-document", route: "ApplicationsScreen" },
    { name: "Application Review", icon: "file-check", route: "ApplicationReview" },
    { name: "Users", icon: "account-multiple", route: "UsersScreen" },
    { name: "Queries", icon: "help-circle", route: "QueriesScreen" },
    { name: "Campus Visit", icon: "store-marker-outline", route: "CampusVisitScreen" },
  ];

  return (
    <LinearGradient colors={["#16222A", "#3A6073"]} style={styles.container}>
      <View style={styles.header}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>{storedUsername.charAt(0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.sectionContainer}>
        {sections.map((section, index) => (
          <TouchableOpacity key={index} style={styles.section} onPress={() => router.push(`/(main)/${section.route}` as any)}>
            <LinearGradient colors={["#4b6cb7", "#182848"]} style={styles.iconCircle}>
              <Icon name={section.icon} size={32} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionText}>{section.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    marginHorizontal: 10,
    marginTop: 15,
  },
  logo: { width: 50, height: 50, borderRadius: 25 },
  profileImage: { width: 45, height: 45, borderRadius: 22.5 },
  profilePlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: { fontSize: 18, fontWeight: "bold", color: "#000" },
  sectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  section: { alignItems: "center", width: "40%", marginVertical: 15 },
  iconCircle: {
    width: 75,
    height: 75,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  sectionText: { marginTop: 10, fontSize: 14, fontWeight: "600", color: "#fff" },
});
