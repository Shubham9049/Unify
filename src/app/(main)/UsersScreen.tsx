import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

// Define a Type for User
type User = {
  Type: string;
  Name: string;
  Email: string;
  Mobile: string;
};

const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<User[]>("https://app.bigwigmedia.in/UsersApi.php")
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  return (
    <LinearGradient colors={["#1F3B8C", "#3A5BA9"]} style={styles.container}>
      <Text style={styles.title}>Users</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={[styles.row, styles.header]}>
              <Text style={styles.headerText}>Type</Text>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Email</Text>
              <Text style={styles.headerText}>Mobile</Text>
            </View>

            {/* Table Data */}
            <FlatList
              data={users}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                  <Text style={styles.cell}>{item.Type}</Text>
                  <Text style={styles.cell}>{item.Name}</Text>
                  <Text style={styles.cell}>{item.Email}</Text>
                  <Text style={styles.cell}>{item.Mobile}</Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default UsersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 15,
  },
  headerText: {
    width: 150,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  cell: {
    width: 150,
    textAlign: "center",
    color: "#fff",
    fontSize: 14,
  },
  evenRow: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  oddRow: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
