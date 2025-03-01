import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const QueriesScreen = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://app.bigwigmedia.in/QueryApi.php")
      .then((response) => {
        setQueries(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching queries:", error);
        setLoading(false);
      });
  }, []);

  return (
    <LinearGradient colors={["#1F3B8C", "#3A5BA9"]} style={styles.container}>
      <Text style={styles.title}>Student Queries</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={[styles.row, styles.header]}>
              <Text style={styles.headerText}>Application No</Text>
              <Text style={styles.headerText}>Student Name</Text>
              <Text style={styles.headerText}>Programme Name</Text>
              <Text style={styles.headerText}>Query</Text>
              <Text style={styles.headerText}>Reply</Text>
              <Text style={styles.headerText}>Query Date</Text>
            </View>

            {/* Table Data */}
            <FlatList
              data={queries}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
                  <Text style={styles.cell}>{item["Application Number"]}</Text>
                  <Text style={styles.cell}>{item["Student Name"]}</Text>
                  <Text style={styles.cell}>{item["Programme Name"]}</Text>
                  <Text style={styles.cell}>{item["Query"]}</Text>
                  <Text style={styles.cell}>{item["Reply"] || "No Reply"}</Text>
                  <Text style={styles.cell}>{item["Query Date"]}</Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
};

export default QueriesScreen;

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
    width: 150, // Increased width for better readability
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  cell: {
    width: 150, // Increased width for better readability
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
