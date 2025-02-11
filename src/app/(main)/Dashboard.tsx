import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const sampleData = [
  { id: "1", appId: "A1001", name: "John Doe", email: "john@example.com", mobile: "9876543210", source: "Website", course: "MBA", location: "New York, USA", status: "Pending", followDate: "2024-02-10", date: "2024-02-05" },
  { id: "2", appId: "A1002", name: "Alice Smith", email: "alice@example.com", mobile: "9876543211", source: "Referral", course: "B.Tech", location: "Los Angeles, USA", status: "Approved", followDate: "2024-02-12", date: "2024-02-07" },
  { id: "3", appId: "A1003", name: "Bob Williams", email: "bob@example.com", mobile: "9876543212", source: "Event", course: "MCA", location: "Chicago, USA", status: "Rejected", followDate: "2024-02-15", date: "2024-02-10" },
  { id: "4", appId: "A1004", name: "Emma Johnson", email: "emma@example.com", mobile: "9876543213", source: "Website", course: "MBA", location: "San Francisco, USA", status: "Pending", followDate: "2024-02-14", date: "2024-02-09" },
  { id: "5", appId: "A1005", name: "Michael Brown", email: "michael@example.com", mobile: "9876543214", source: "Referral", course: "BCA", location: "Seattle, USA", status: "Approved", followDate: "2024-02-16", date: "2024-02-08" },
  { id: "6", appId: "A1006", name: "Sophia Davis", email: "sophia@example.com", mobile: "9876543215", source: "Social Media", course: "BBA", location: "Boston, USA", status: "Pending", followDate: "2024-02-18", date: "2024-02-12" },
  { id: "7", appId: "A1007", name: "William Martinez", email: "william@example.com", mobile: "9876543216", source: "Event", course: "M.Tech", location: "Houston, USA", status: "Rejected", followDate: "2024-02-20", date: "2024-02-14" },
  { id: "8", appId: "A1008", name: "Olivia White", email: "olivia@example.com", mobile: "9876543217", source: "Website", course: "MBA", location: "Denver, USA", status: "Approved", followDate: "2024-02-21", date: "2024-02-15" },
  { id: "9", appId: "A1009", name: "James Lee", email: "james@example.com", mobile: "9876543218", source: "Referral", course: "B.Sc", location: "Phoenix, USA", status: "Pending", followDate: "2024-02-22", date: "2024-02-17" },
  { id: "10", appId: "A1010", name: "Charlotte Hall", email: "charlotte@example.com", mobile: "9876543219", source: "Social Media", course: "B.Tech", location: "Dallas, USA", status: "Rejected", followDate: "2024-02-23", date: "2024-02-18" },
  { id: "11", appId: "A1011", name: "Ethan Allen", email: "ethan@example.com", mobile: "9876543220", source: "Website", course: "MCA", location: "Miami, USA", status: "Approved", followDate: "2024-02-25", date: "2024-02-20" },
  { id: "12", appId: "A1012", name: "Amelia Scott", email: "amelia@example.com", mobile: "9876543221", source: "Event", course: "BBA", location: "Atlanta, USA", status: "Pending", followDate: "2024-02-26", date: "2024-02-21" },
  { id: "13", appId: "A1013", name: "Daniel Harris", email: "daniel@example.com", mobile: "9876543222", source: "Referral", course: "M.Tech", location: "Las Vegas, USA", status: "Rejected", followDate: "2024-02-27", date: "2024-02-22" },
  { id: "14", appId: "A1014", name: "Isabella Clark", email: "isabella@example.com", mobile: "9876543223", source: "Social Media", course: "MBA", location: "San Diego, USA", status: "Approved", followDate: "2024-02-28", date: "2024-02-23" },
  { id: "15", appId: "A1015", name: "Matthew Lewis", email: "matthew@example.com", mobile: "9876543224", source: "Website", course: "B.Tech", location: "Portland, USA", status: "Pending", followDate: "2024-03-01", date: "2024-02-24" },
  { id: "16", appId: "A1016", name: "Mia Young", email: "mia@example.com", mobile: "9876543225", source: "Event", course: "B.Sc", location: "Austin, USA", status: "Rejected", followDate: "2024-03-02", date: "2024-02-25" },
  { id: "17", appId: "A1017", name: "Alexander Walker", email: "alexander@example.com", mobile: "9876543226", source: "Referral", course: "MCA", location: "Orlando, USA", status: "Approved", followDate: "2024-03-03", date: "2024-02-26" },
  { id: "18", appId: "A1018", name: "Harper King", email: "harper@example.com", mobile: "9876543227", source: "Social Media", course: "BBA", location: "Nashville, USA", status: "Pending", followDate: "2024-03-04", date: "2024-02-27" },
  { id: "19", appId: "A1019", name: "Benjamin Wright", email: "benjamin@example.com", mobile: "9876543228", source: "Website", course: "B.Tech", location: "Indianapolis, USA", status: "Rejected", followDate: "2024-03-05", date: "2024-02-28" },
  { id: "20", appId: "A1020", name: "Emily Lopez", email: "emily@example.com", mobile: "9876543229", source: "Event", course: "MBA", location: "Columbus, USA", status: "Approved", followDate: "2024-03-06", date: "2024-02-29" },
  // Continue with similar patterns for 21-40
];

const Dashboard = () => {
  const [filters, setFilters] = useState({
    appId: "",
    name: "",
    email: "",
    mobile: "",
    source: "",
    course: "",
    location: "",
    status: "",
    followDate: "",
    date: "",
  });

  const [filteredData, setFilteredData] = useState(sampleData);

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  const applyFilter = () => {
    setFilteredData(
      sampleData.filter((item) =>
        Object.keys(filters).every(
          (key) =>
            !filters[key as keyof typeof filters] || // Ignore if no filter applied
            item[key as keyof typeof item]
              .toString()
              .toLowerCase()
              .includes(filters[key as keyof typeof filters].toLowerCase())
        )
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterBox}>
        <Text style={styles.filterTitle}>Follow ups Details</Text>
        <View style={styles.filterGrid}>
          {Object.keys(filters).map((key, index) => (
            <TextInput
              key={index}
              style={styles.searchInput}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={filters[key as keyof typeof filters]}
              onChangeText={(value) => handleFilterChange(key, value)}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={applyFilter}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Table Section with Scrolling */}
      <ScrollView horizontal>
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {["#", "App Id", "Name", "Email", "Mobile", "Source", "Course", "State / City", "Status", "Follow Date", "Date", "Action"].map((header, index) => (
              <Text key={index} style={styles.headerText}>{header}</Text>
            ))}
          </View>

          {/* Table Rows */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.tableRow}>
                <Text style={styles.cell}>{index + 1}</Text>
                <Text style={styles.cell}>{item.appId}</Text>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.email}</Text>
                <Text style={styles.cell}>{item.mobile}</Text>
                <Text style={styles.cell}>{item.source}</Text>
                <Text style={styles.cell}>{item.course}</Text>
                <Text style={styles.cell}>{item.location}</Text>
                <Text style={styles.cell}>{item.status}</Text>
                <Text style={styles.cell}>{item.followDate}</Text>
                <Text style={styles.cell}>{item.date}</Text>
                <Text style={[styles.cell, styles.action]}>View</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  filterBox: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  searchInput: {
    width: "48%", // Makes it a 2-column grid
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 10,
  },
  headerText: {
    flex: 1,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  action: {
    color: "blue",
    fontWeight: "bold",
  },
});
