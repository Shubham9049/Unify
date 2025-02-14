import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { setProfileImage } from "../../redux/profileSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select"; // Importing the picker library

export default function Profile() {
  const { user } = useUser();
  const [storedUserData, setStoredUserData] = useState({
    username: "Guest",
    email: "No email found",
  });
  const [userInfo, setUserInfo] = useState({
    nationality: "",
    phone: "",
    Gender: "",
  });
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editableUserInfo, setEditableUserInfo] = useState(userInfo);
  const [countries, setCountries] = useState<string[]>([]);

  const dispatch = useDispatch();
  const { profileImage } = useSelector((state: RootState) => state.profile);
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    // Fetch countries list on component mount
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countryNames = response.data.map(
          (country: any) => country.name.common
        );
        setCountries(countryNames);
      } catch (error) {
        console.error("Error fetching countries:", error);
        Alert.alert("Error", "Failed to fetch country list.");
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        const savedEmail = await AsyncStorage.getItem("email");
        const clerkEmail = user?.primaryEmailAddress?.emailAddress;
        const image = await AsyncStorage.getItem("profileImage");
        const storedUserId = await AsyncStorage.getItem("mongoId");
        setStoredUserData({
          username: username || "Guest",
          email: savedEmail || "No email found",
        });
        const userEmail = clerkEmail || savedEmail || "";
        setEmail(userEmail);

        setUserID(storedUserId);
        if (image) {
          dispatch(setProfileImage(image));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, dispatch]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Fetch user data from backend
      const response = await axios.get(
        `https://app-database.onrender.com/user/userdata/${email}`
      );
      if (response.status === 200) {
        setUserInfo({
          nationality: response.data.nationality || "",
          phone: response.data.phone || "",
          Gender: response.data.Gender || "",
        });
        setEditableUserInfo({
          nationality: response.data.nationality || "",
          phone: response.data.phone || "",
          Gender: response.data.Gender || "",
        });
      }
    };

    fetchUserData();
  }, [email]);

  const handleProfileImageChange = async () => {
    if (user?.imageUrl) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      updateProfileImage(selectedImage);
    }
  };

  const updateProfileImage = async (selectedImage: string) => {
    dispatch(setProfileImage(selectedImage));
    await AsyncStorage.setItem("profileImage", selectedImage);

    const formData = new FormData();
    formData.append("image", {
      uri: selectedImage,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      await axios.post(
        `https://app-database.onrender.com/user/upload-profile-image/${email}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch (error) {
      console.error("Error uploading profile image:", error);
      Alert.alert(
        "Upload Failed",
        "There was an issue uploading your profile picture."
      );
    }
  };

  // Toggle Edit Mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditableUserInfo(userInfo); // Reset to original values
    }
  };

  // Handle Save Changes
  const handleSaveChanges = async () => {
    try {
      await axios.patch(
        `https://app-database.onrender.com/user/update-profile/${email}`,
        editableUserInfo
      );
      setUserInfo(editableUserInfo);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const userName = user?.fullName || storedUserData.username;
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || storedUserData.email;
  const isGoogleOrFacebookUser = Boolean(user?.imageUrl);
  const displayImage = user?.imageUrl || profileImage || null;
  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>{userName.charAt(0)}</Text>
            </View>
          )}

          {/* Change Profile Image Button */}
          {!isGoogleOrFacebookUser && (
            <TouchableOpacity
              onPress={handleProfileImageChange}
              style={styles.changeImageButton}
            >
              <MaterialIcons name="camera-alt" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      {/* Profile Details Section */}
      <View style={styles.detailsCard}>
        {/* Gender Selection */}
        <Text style={styles.label}>Gender</Text>
        {isEditing ? (
          <View style={styles.genderSelection}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                editableUserInfo.Gender === "Male" && styles.selectedGender,
              ]}
              onPress={() =>
                setEditableUserInfo({ ...editableUserInfo, Gender: "Male" })
              }
            >
              <Text style={styles.genderButtonText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                editableUserInfo.Gender === "Female" && styles.selectedGender,
              ]}
              onPress={() =>
                setEditableUserInfo({ ...editableUserInfo, Gender: "Female" })
              }
            >
              <Text style={styles.genderButtonText}>Female</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.infoText}>
            {userInfo.Gender ? userInfo.Gender : ""}
          </Text>
        )}

        {/* Phone Input */}
        <Text style={styles.label}>Phone</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={editableUserInfo.phone}
            onChangeText={(text) =>
              setEditableUserInfo({ ...editableUserInfo, phone: text })
            }
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.infoText}>
            {userInfo.phone ? userInfo.phone : ""}
          </Text>
        )}

        {/* Nationality Input */}
        <Text style={styles.label}>Nationality</Text>
        {isEditing ? (
          <Picker
            selectedValue={editableUserInfo.nationality}
            style={styles.input}
            onValueChange={(value) =>
              setEditableUserInfo({ ...editableUserInfo, nationality: value })
            }
          >
            {countries.map((country, index) => (
              <Picker.Item key={index} label={country} value={country} />
            ))}
          </Picker>
        ) : (
          <Text style={styles.infoText}>
            {userInfo.nationality || "Not Provided"}
          </Text>
        )}

        {/* Edit / Save & Cancel Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveChanges}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleEditToggle}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditToggle}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F3B8C",
    alignItems: "center",
  },
  profileSection: {
    width: "100%",
    backgroundColor: "#3A5BA9",
    paddingBottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInitial: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  infoCard: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 15,
    marginTop: -40,
    alignItems: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 16,
    color: "#777",
    marginTop: 5,
  },
  detailsCard: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    color: "#777",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 15,
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  genderSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  genderButton: {
    backgroundColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  selectedGender: {
    backgroundColor: "#007bff",
  },
  genderButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
