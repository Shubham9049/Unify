import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const ApplicationsScreen = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; // Number of items per page

  useEffect(() => {
    axios
      .get("https://app.bigwigmedia.in/StudentsApi.php")
      .then((response) => {
        const verifiedStudents = response.data.filter(
          (student: { Status: string }) => student.Status === "Verified"
        );
        setStudents(verifiedStudents);
        setFilteredStudents(verifiedStudents);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  }, []);

  // Search Filter
  useEffect(() => {
    const filtered = students.filter((student) =>
      Object.values(student)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to page 1 when searching
  }, [searchText, students]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedData = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.container}>
      <Text style={styles.title}>Student Verified Applications</Text>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#ccc"
        value={searchText}
        onChangeText={setSearchText}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FACC15" />
        </View>
      ) : (
        <>
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
                data={paginatedData}
                keyExtractor={(item) => item["Student ID"]}
                renderItem={({ item, index }) => (
                  <View
                    style={[
                      styles.row,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    ]}
                  >
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

          {/* Pagination Controls */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((prev) => prev - 1)}
            >
              <Text style={styles.paginationText}>Previous</Text>
            </TouchableOpacity>

            <Text style={styles.pageNumber}>
              Page {currentPage} of {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((prev) => prev + 1)}
            >
              <Text style={styles.paginationText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
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
    color: "#FACC15",
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
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 5,
  },
  headerText: {
    width: 100,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FACC15",
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  paginationButton: {
    backgroundColor: "#FACC15",
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
    color: "#FACC15",
  },
  disabledButton: {
    backgroundColor: "gray",
  },
});
