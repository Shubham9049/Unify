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
    <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.container}>
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
      {loading && <ActivityIndicator size="large" color="#FACC15" style={styles.loader} />}

      {/* Error Message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Application Data */}
      {applicationData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Application Details</Text>
          {[
            { label: 'ID', key: 'Student ID' },
            { label: 'Name', key: 'Student Name' },
            { label: 'Email', key: 'Email' },
            { label: 'Mobile', key: 'Mobile Number' },
            { label: 'Status', key: 'Status' },
            { label: 'Lead Source', key: 'Lead Source' },
            { label: 'Lead Status', key: 'Lead Status' },
            { label: 'Reg. Date', key: 'Registration Date' },
            { label: 'Programme', key: 'Programme Name' }
          ].map(({ label, key }) => (
            <Text key={key} style={styles.cardText}>
              <Text style={styles.label}>{label}:</Text> {applicationData[key]}
            </Text>
          ))}
        </View>
      )}
    </LinearGradient>
  );
};

export default ApplicationReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FACC15',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F3B8C',
  },
  loader: {
    marginVertical: 15,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FACC15',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#FACC15',
  },
});
