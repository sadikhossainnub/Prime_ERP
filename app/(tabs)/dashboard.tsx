import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import PipelineChart from "../../components/PipelineChart";
import { getDashboardData } from "../../services/dashboard";

const screenWidth = Dimensions.get("window").width - 32;

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Error loading dashboard data.</Text>
      </View>
    );
  }

  // Prepare bar chart data
  const barData = {
    labels: Object.keys(data.salesByDate).slice(-7), // last 7 days
    datasets: [
      {
        data: Object.values(data.salesByDate).slice(-7) as number[],
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* KPI Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.label}>📦 Sales Orders</Text>
          <Text style={styles.value}>{data.salesCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>💰 Total Sales</Text>
          <Text style={styles.value}>{data.totalSales.toFixed(2)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>👥 Customers</Text>
          <Text style={styles.value}>{data.customerCount}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>🏭 Items</Text>
          <Text style={styles.value}>{data.itemCount}</Text>
        </View>
      </View>

      {/* Sales Pipeline */}
      <Text style={styles.chartTitle}>📈 Sales Pipeline</Text>
      <PipelineChart data={data.salesPipelineData} />

      {/* Bar Chart */}
      <Text style={styles.chartTitle}>📊 Sales Trend (Last 7 Days)</Text>
      <BarChart
        data={barData}
        width={screenWidth}
        height={220}
        yAxisLabel="৳"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#f9f9f9",
          backgroundGradientTo: "#f9f9f9",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />

      {/* Pie Chart */}
      <Text style={styles.chartTitle}>🥧 Top Selling Items</Text>
      <PieChart
        data={data.topItems}
        width={screenWidth}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        accessor={"value"}
        backgroundColor={"transparent"}
        paddingLeft={"10"}
        absolute
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginTop: 30,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    width: "48%", // for 2 columns
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    color: "#333",
  },
  chart: {
    borderRadius: 12,
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
