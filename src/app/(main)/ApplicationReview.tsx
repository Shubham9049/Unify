import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const ApplicationReviewScreen = () => {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchApplicationData = () => {
    if (!applicationNumber.trim()) {
      setError('Please enter an application number.');
      return;
    }

    setLoading(true);
    setError('');
    setApplicationData(null);

    axios
      .post('https://app.bigwigmedia.in/ApplicationApi.php', { application_number: applicationNumber })
      .then((response) => {
        setApplicationData(response.data[0]);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching application data:', error);
        setError('Failed to fetch data. Please try again.');
        setLoading(false);
      });
  };

  return (
    <LinearGradient colors={["#1F3B8C", "#3A5BA9"]} style={styles.container}>
      <Text style={styles.title}>Application Review</Text>

      {/* Input Field */}
      
      <TextInput
        style={styles.input}
        placeholder="Enter Application Number"
        placeholderTextColor="#ccc"
        value={applicationNumber}
        onChangeText={setApplicationNumber}
      />

      {/* Fetch Button */}
      <TouchableOpacity style={styles.button} onPress={fetchApplicationData}>
        <Text style={styles.buttonText}>Fetch Application</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Application Data */}
      {applicationData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Details</Text>
          <Text style={styles.cardText}><Text style={styles.label}>ID:</Text> {applicationData["Student ID"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Name:</Text> {applicationData["Student Name"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Email:</Text> {applicationData["Email"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Mobile:</Text> {applicationData["Mobile Number"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Status:</Text> {applicationData["Status"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Lead Source:</Text> {applicationData["Lead Source"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Lead Status:</Text> {applicationData["Lead Status"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Reg. Date:</Text> {applicationData["Registration Date"]}</Text>
          <Text style={styles.cardText}><Text style={styles.label}>Programme:</Text> {applicationData["Programme Name"]}</Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default ApplicationReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#1F3B8C",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 10,
  },
  errorText: {
    color: "#ff4d4d",
    textAlign: "center",
    marginTop: 5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
});
