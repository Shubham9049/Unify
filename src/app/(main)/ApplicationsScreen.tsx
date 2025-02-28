import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const ApplicationsScreen = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://app.bigwigmedia.in/StudentsApi.php") // API URL
      .then((response) => {
        // Filter only students with Status: "Verified"
        const verifiedStudents = response.data.filter(
          (student: { Status: string }) => student.Status === "Verified"
        );
        setStudents(verifiedStudents);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  }, []);

  return (
    <LinearGradient colors={["#1F3B8C", "#3A5BA9"]} style={styles.container}>
      <Text style={styles.title}>Student Verified Applications</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={[styles.row, styles.header]}>
              <Text style={styles.headerText}>ID</Text>
              <Text style={styles.headerText}>Name</Text>
              <Text style={styles.headerText}>Email</Text>
              <Text style={styles.headerText}>Mobile</Text>
              <Text style={styles.headerText}>Status</Text>
              <Text style={styles.headerText}>Lead Source</Text>
              <Text style={styles.headerText}>Lead Status</Text>
              <Text style={styles.headerText}>Reg. Date</Text>
              <Text style={styles.headerText}>App No.</Text>
              <Text style={styles.headerText}>Programme</Text>
            </View>

            {/* Table Data */}
            <FlatList
              data={students}
              keyExtractor={(item) => item["Student ID"]}
              renderItem={({ item, index }) => (
                <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                  <Text style={styles.cell}>{item["Student ID"]}</Text>
                  <Text style={styles.cell}>{item["Student Name"]}</Text>
                  <Text style={styles.cell}>{item["Email"]}</Text>
                  <Text style={styles.cell}>{item["Mobile Number"]}</Text>
                  <Text style={styles.cell}>{item["Status"]}</Text>
                  <Text style={styles.cell}>{item["Lead Source"]}</Text>
                  <Text style={styles.cell}>{item["Lead Status"]}</Text>
                  <Text style={styles.cell}>{item["Registration Date"]}</Text>
                  <Text style={styles.cell}>{item["Application Number"]}</Text>
                  <Text style={styles.cell}>{item["Programme Name"]}</Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default ApplicationsScreen;

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
    width: 100,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  cell: {
    width: 100,
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
