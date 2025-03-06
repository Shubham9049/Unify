import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const Dashboard = () => {
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://app.bigwigmedia.in/StudentsApi.php")
      .then((response) => {
        setTotalLeads(response.data.length);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching total leads:", error);
        setLoading(false);
      });
  }, []);

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.container}>
      <Text style={styles.title}> Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FACC15" style={styles.loader} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Leads</Text>
          <Text style={styles.count}>{totalLeads}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FACC15",
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
  },
  loader: {
    marginTop: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FACC15",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    color: "#FACC15",
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  count: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FACC15",
    textShadowColor: "rgba(250, 204, 21, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
});