import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import PipelineChart from "../../components/PipelineChart";
import { useThemeColor } from "../../hooks/useThemeColor";
import { getDashboardData } from "../../services/dashboard";

const screenWidth = Dimensions.get("window").width - 32;

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const cardBackgroundColor = useThemeColor({}, "cardBackground");
  const iconColor = useThemeColor({}, "icon");

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

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
    tint: tintColor,
    cardBackground: cardBackgroundColor,
    icon: iconColor,
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={tintColor} />
        <Text style={{ color: textColor }}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={{ color: textColor }}>Error loading dashboard data.</Text>
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
          backgroundColor: cardBackgroundColor,
          backgroundGradientFrom: cardBackgroundColor,
          backgroundGradientTo: cardBackgroundColor,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          labelColor: (opacity = 1) => textColor,
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
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          labelColor: (opacity = 1) => textColor,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"10"}
        absolute
      />

    </ScrollView>
  );
}

const getStyles = (theme: {
  background: string;
  text: string;
  tint: string;
  cardBackground: string;
  icon: string;
}) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.background,
      marginTop: 30,
    },
    cardsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: "48%", // for 2 columns
    },
    label: {
      fontSize: 16,
      color: theme.icon,
      marginBottom: 8,
    },
    value: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.tint,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginVertical: 12,
      color: theme.text,
    },
    chart: {
      borderRadius: 12,
      marginBottom: 20,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
  });
