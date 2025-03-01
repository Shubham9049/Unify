import { StyleSheet, Text, View, FlatList, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

const LeadsScreen = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    axios
      .get("https://app.bigwigmedia.in/StudentsApi.php")
      .then((response) => {
        setStudents(response.data);
        setFilteredStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = students.filter((student) =>
      Object.values(student)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1); 
  }, [searchText, students]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedData = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <LinearGradient colors={["#1F3B8C", "#3A5BA9"]} style={styles.container}>
      <Text style={styles.title}>Student Applications</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#ccc"
        value={searchText}
        onChangeText={setSearchText}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <ScrollView horizontal>
          <View>
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

            <FlatList
              data={paginatedData}
              keyExtractor={(item) => String(item["Student ID"])}
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

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
          disabled={currentPage === 1}
          onPress={() => setCurrentPage((prev) => prev - 1)}
        >
          <Text style={styles.paginationText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.pageNumber}>Page {currentPage} of {totalPages}</Text>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage((prev) => prev + 1)}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default LeadsScreen;

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
  searchInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,

  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  evenRow: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  oddRow: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  paginationButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F3B8C",
  },
  pageNumber: {
    fontSize: 16,
    color: "#fff",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
});
