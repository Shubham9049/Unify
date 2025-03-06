import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const CampusVisitScreen = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    axios
      .get("https://app.bigwigmedia.in/CampusVisitApi.php")
      .then((response) => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
      });
  }, []);

  // Memoized search filter
  const filteredQueries = useMemo(() => {
    return students.filter((query) =>
      Object.values(query)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, students]);

  // Memoized pagination
  const paginatedData = useMemo(() => {
    return filteredQueries.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredQueries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.container}>
      <Text style={styles.title}>Campus Visit</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor="#ccc"
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          setCurrentPage(1);
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FACC15" />
        </View>
      ) : (
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={[styles.row, styles.header]}>
              {["Student Name", "Email", "Mobile", "Scheduled Date", "Scheduled Time", "Number of Guests"].map(
                (header, index) => (
                  <Text key={index} style={styles.headerText}>
                    {header}
                  </Text>
                )
              )}
            </View>

            {/* Table Data */}
            <FlatList
              data={paginatedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.row,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={styles.cell}>{item["Student Name"]}</Text>
                  <Text style={styles.cell}>{item["Email"]}</Text>
                  <Text style={styles.cell}>{item["Mobile"]}</Text>
                  <Text style={styles.cell}>{item["Scheduled Date"]}</Text>
                  <Text style={styles.cell}>{item["Scheduled Time"]}</Text>
                  <Text style={styles.cell}>{item["Number of Guests"]}</Text>
                </View>
              )}
            />
          </View>
        </ScrollView>
      )}

      {filteredQueries.length > 0 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === 1 && styles.disabledButton,
            ]}
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((prev) => prev - 1)}
          >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.pageNumber}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage === totalPages && styles.disabledButton,
            ]}
            disabled={currentPage === totalPages}
            onPress={() => setCurrentPage((prev) => prev + 1)}
          >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

export default CampusVisitScreen;

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
    marginBottom:5
  },
  headerText: {
    width: 120,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FACC15",
  },
  cell: {
    width: 120,
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
    opacity: 0.6,
  },
  searchInput: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
    fontSize: 16,
  },
});
