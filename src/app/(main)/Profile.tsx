import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth, useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import { setProfileImage } from "../../redux/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";

export default function Profile() {
  const { user } = useUser();
  const { userId } = useAuth();
  const [storedUserData, setStoredUserData] = useState({
    username: "Guest",
    email: "No email found",
    nationality: "",
    phone: "",
  });
  //   console.log(user)
  const dispatch = useDispatch();
  const { profileImage } = useSelector((state: RootState) => state.profile);
  const [editable, setEditable] = useState(false);
  const [nationality, setNationality] = useState("");
  const [phone, setPhone] = useState("");
  const [Gender, setGender] = useState("");
  const [userID, setUserID] = useState<string | null>(null);
  const [tempGender, setTempGender] = useState("");
  const [tempNationality, setTempNationality] = useState("");
  const [tempPhone, setTempPhone] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        const email = await AsyncStorage.getItem("email");
        const storedNationality = await AsyncStorage.getItem("nationality");
        const storedPhone = await AsyncStorage.getItem("phone");
        const storedGender = await AsyncStorage.getItem("gender");
        const image = await AsyncStorage.getItem("profileImage");
        const StoredUserId = await AsyncStorage.getItem("mongoId");
        console.log(StoredUserId);

        setStoredUserData({
          username: username || "Guest",
          email: email || "No email found",
          nationality: storedNationality || "",
          phone: storedPhone || "",
        });
        setNationality(storedNationality || "");
        setPhone(storedPhone || "");
        setProfileImage(image);
        setUserID(StoredUserId);
        setGender(storedGender || "");
        if (image) {
          dispatch(setProfileImage(image)); // Set profile image from AsyncStorage
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [dispatch]);

  const handleProfileUpdate = async () => {
    try {
      if (!Gender || !nationality || !phone) {
        Alert.alert(
          "Missing Information",
          "Please fill all fields before saving."
        );
        return;
      }

      await AsyncStorage.setItem("nationality", nationality);
      await AsyncStorage.setItem("phone", phone);
      await AsyncStorage.setItem("gender", Gender);

      await axios.patch(
        `https://app-database.onrender.com/user/update-profile/${userID}`,
        {
          nationality,
          phone,
          Gender,
        }
      );

      alert("Profile Update successfully");
      setEditable(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const handleProfileImageChange = async () => {
    if (user?.imageUrl) return; // Prevent changes for Google/Facebook users

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
    dispatch(setProfileImage(selectedImage)); // Update Redux store
    await AsyncStorage.setItem("profileImage", selectedImage); // Persist to AsyncStorage

    // Send to backend as well
    const formData = new FormData();
    formData.append("image", {
      uri: selectedImage,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      await axios.post(
        `https://app-database.onrender.com/user/upload-profile-image/${userID}`,
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

  const userName = user?.fullName || storedUserData.username;
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || storedUserData.email;
  const isGoogleOrFacebookUser = Boolean(user?.imageUrl); // Check if user logged in via Google/Facebook

  const displayImage = user?.imageUrl || profileImage || null;

  const handleEdit = () => {
    setTempGender(Gender);
    setTempNationality(nationality);
    setTempPhone(phone);
    setEditable(true);
  };
  const handleCancelEdit = () => {
    setGender(tempGender);
    setNationality(tempNationality);
    setPhone(tempPhone);
    setEditable(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        {/* Display user image if available, otherwise show first letter of name */}
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profilePlaceholder}>
            <Text style={styles.profileInitial}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {!isGoogleOrFacebookUser && (
          <TouchableOpacity
            onPress={handleProfileImageChange}
            style={styles.changeImageButton}
          >
            <Text style={styles.changeImageText}>Change Profile Image</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>

        {!isGoogleOrFacebookUser && (
          <View style={styles.Editcontainer}>
            <View style={styles.card}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderBox,
                  Gender === "Male" && styles.selectedGender,  // Apply glow effect if 'Male' is selected
                ]}
                onPress={() => {
                  if (editable) {  // Allow gender selection if profile is in editable state
                    setGender("Male");
                  }
                }}
                disabled={!editable} // Disable if not in editing mode
              >
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderBox,
                  Gender === "Female" && styles.selectedGender,  // Apply glow effect if 'Female' is selected
                ]}
                onPress={() => {
                  if (editable) {  // Allow gender selection if profile is in editable state
                    setGender("Female");
                  }
                }}
                disabled={!editable} // Disable if not in editing mode
              >
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
            </View>



              <Text style={styles.label}>Nationality</Text>
              <Picker
                selectedValue={nationality}
                style={styles.input}
                onValueChange={(itemValue) => setNationality(itemValue)}
                enabled={editable}
              >
                <Picker.Item label="Select Nationality" value="" />
                <Picker.Item label="American" value="American" />
                <Picker.Item label="Canadian" value="Canadian" />
                <Picker.Item label="Indian" value="Indian" />
                <Picker.Item label="British" value="British" />
              </Picker>

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={phone}
                editable={editable}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {editable ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleProfileUpdate}
                    style={styles.saveButton}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.editButton}
                >
                  <MaterialIcons name="edit" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileInitial: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  changeImageButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  userEmail: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  userPhone: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  Editcontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f5f5f5",
  },
  card: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    fontSize: 16,
    // borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  genderBox: {
    flex: 1,
    paddingVertical: 15,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 5,
  },
  selectedGender: {
    borderColor: "#007BFF",  // Blue border for the selected option
    backgroundColor: "#e0f7fa", // Light blue background when selected
    elevation: 4,  // Adds a slight shadow/glow effect
  },
  genderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
