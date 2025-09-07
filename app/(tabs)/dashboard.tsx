import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../../components/ui/IconSymbol"; // Assuming IconSymbol is used for icons
import { useThemeColor } from "../../hooks/useThemeColor";

export default function DashboardScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint"); // Assuming a tint color for icons/buttons

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
    tint: tintColor,
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>Welcome back, Administrator!</Text>
      <Text style={styles.salesOverviewText}>Sales overview and quick actions</Text>

      {/* Quick Actions Section */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.primaryButton]}>
            <IconSymbol name="plus" size={20} color="white" />
            <Text style={styles.primaryButtonText}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <IconSymbol name="plus" size={20} color={textColor} />
            <Text style={styles.buttonText}>New Quote</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}>
            <IconSymbol name="customers" size={20} color={textColor} />
            <Text style={styles.buttonText}>Customers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <IconSymbol name="items" size={20} color={textColor} />
            <Text style={styles.buttonText}>Items</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Revenue Overview Section */}
      <View style={styles.revenueOverviewContainer}>
        <Text style={styles.revenueOverviewTitle}>Revenue Overview</Text>
        <View style={styles.revenueItem}>
          <IconSymbol name="revenue" size={24} color="#82E0AA" />
          <View style={styles.revenueDetails}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <Text style={styles.revenueValue}>$46,821.25</Text>
          </View>
          <View style={styles.growthIndicator}>
            <IconSymbol name="chart.line.up" size={16} color="#2ECC71" />
            <Text style={styles.growthText}>+12.5%</Text>
          </View>
        </View>
        <View style={styles.revenueItem}>
          <IconSymbol name="calendar" size={24} color="#AED6F1" />
          <View style={styles.revenueDetails}>
            <Text style={styles.revenueLabel}>This Month</Text>
            <Text style={styles.revenueValue}>$0.00</Text>
          </View>
          <View style={styles.growthIndicator}>
            <IconSymbol name="chart.line.up" size={16} color="#3498DB" />
            <Text style={styles.growthText}>+8.2%</Text>
          </View>
        </View>
      </View>

      {/* Orders and Quotes Sections */}
      <View style={styles.cardRow}>
        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="orders" size={20} color={textColor} />
            <Text style={styles.cardTitle}>Orders</Text>
            <IconSymbol name="arrow.right" size={20} color={textColor} />
          </View>
          <Text style={styles.cardValue}>3</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardStatus}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#2ECC71" /> 1 completed
            </Text>
            <Text style={styles.cardStatus}>2 pending</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardHeader}>
            <IconSymbol name="quotes" size={20} color={textColor} />
            <Text style={styles.cardTitle}>Quotes</Text>
            <IconSymbol name="arrow.right" size={20} color={textColor} />
          </View>
          <Text style={styles.cardValue}>2</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardStatus}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#2ECC71" /> 1 approved
            </Text>
            <Text style={styles.cardStatus}>1 drafts</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Status Overview Section */}
      <View style={styles.statusOverviewContainer}>
        <Text style={styles.statusOverviewTitle}>Status Overview</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusColumn}>
            <Text style={styles.statusColumnTitle}>Orders</Text>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Confirmed</Text>
              <Text style={styles.statusValueGreen}>24</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Pending</Text>
              <Text style={styles.statusValue}>2</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Delivered</Text>
              <Text style={styles.statusValue}>11</Text>
            </View>
          </View>
          <View style={styles.statusColumn}>
            <Text style={styles.statusColumnTitle}>Quotations</Text>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Approved</Text>
              <Text style={styles.statusValueGreen}>1</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Sent</Text>
              <Text style={styles.statusValue}>9</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Draft</Text>
              <Text style={styles.statusValue}>1</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Attention Needed Section */}
      <View style={styles.attentionNeededContainer}>
        <View style={styles.attentionNeededHeader}>
          <IconSymbol name="attention" size={20} color="#FFC107" />
          <Text style={styles.attentionNeededTitle}>Attention Needed</Text>
        </View>
        <View style={styles.attentionItem}>
          <Text style={styles.attentionText}>3 quotations expiring soon</Text>
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.attentionItem}>
          <Text style={styles.attentionText}>5 orders awaiting confirmation</Text>
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.recentActivityContainer}>
        <View style={styles.recentActivityHeader}>
          <Text style={styles.recentActivityTitle}>Recent Activity</Text>
          <Text style={styles.recentActivityFilter}>Last 24 hours</Text>
        </View>

        <View style={styles.activityItem}>
          <View style={styles.activityIconContainer}>
            <IconSymbol name="recent.activity.order" size={20} color={textColor} />
          </View>
          <View style={styles.activityDetails}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Order SO-2025-001</Text>
              <Text style={styles.activityStatus}>to deliver and bill</Text>
            </View>
            <Text style={styles.activitySubtitle}>Acme Corporation</Text>
            <Text style={styles.activityAmount}>$15,750.50</Text>
          </View>
          <Text style={styles.activityTime}>234 days ago</Text>
        </View>

        <View style={styles.activityItem}>
          <View style={styles.activityIconContainer}>
            <IconSymbol name="recent.activity.order" size={20} color={textColor} />
          </View>
          <View style={styles.activityDetails}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Order SO-2025-002</Text>
              <Text style={styles.activityStatus}>completed</Text>
            </View>
            <Text style={styles.activitySubtitle}>Global Tech Solutions</Text>
            <Text style={styles.activityAmount}>$8,920.00</Text>
          </View>
          <Text style={styles.activityTime}>235 days ago</Text>
        </View>

        <View style={styles.activityItem}>
          <View style={styles.activityIconContainer}>
            <IconSymbol name="recent.activity.order" size={20} color={textColor} />
          </View>
          <View style={styles.activityDetails}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Order SO-2025-003</Text>
              <Text style={styles.activityStatus}>draft</Text>
            </View>
            <Text style={styles.activitySubtitle}>Digital Dynamics</Text>
            <Text style={styles.activityAmount}>$22,150.75</Text>
          </View>
          <Text style={styles.activityTime}>236 days ago</Text>
        </View>

        <View style={styles.activityItem}>
          <View style={styles.activityIconContainer}>
            <IconSymbol name="recent.activity.quote" size={20} color={textColor} />
          </View>
          <View style={styles.activityDetails}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Quote QT-2025-001</Text>
              <Text style={styles.activityStatus}>submitted</Text>
            </View>
            <Text style={styles.activitySubtitle}>Future Enterprises</Text>
            <Text style={styles.activityAmount}>$12,300.75</Text>
          </View>
          <Text style={styles.activityTime}>233 days ago</Text>
        </View>
      </View>

      {/* Attention Needed Section */}
      <View style={styles.attentionNeededContainer}>
        <View style={styles.attentionNeededHeader}>
          <IconSymbol name="attention" size={20} color="#FFC107" />
          <Text style={styles.attentionNeededTitle}>Attention Needed</Text>
        </View>
        <View style={styles.attentionItem}>
          <Text style={styles.attentionText}>3 quotations expiring soon</Text>
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.attentionItem}>
          <Text style={styles.attentionText}>5 orders awaiting confirmation</Text>
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: {
  background: string;
  text: string;
  tint: string;
}) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: "white", // Changed to white
      paddingTop: 30,
    },
    welcomeText: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 5,
    },
    salesOverviewText: {
      color: theme.text,
      fontSize: 16,
      marginBottom: 20,
    },
    quickActionsContainer: {
      backgroundColor: "white", // Assuming white background for the card
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 20, // Add margin bottom for spacing
    },
    quickActionsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.text,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f0f0f0", // Light grey for secondary buttons
      paddingVertical: 15,
      borderRadius: 8,
      marginHorizontal: 5,
    },
    primaryButton: {
      backgroundColor: "#212121", // Dark background for primary button
    },
    buttonText: {
      color: theme.text,
      fontSize: 16,
      marginLeft: 5,
      fontWeight: "bold",
    },
    primaryButtonText: {
      color: "white",
      fontSize: 16,
      marginLeft: 5,
      fontWeight: "bold",
    },
    revenueOverviewContainer: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginBottom: 20,
    },
    revenueOverviewTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.text,
    },
    revenueItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    revenueDetails: {
      flex: 1,
      marginLeft: 10,
    },
    revenueLabel: {
      fontSize: 16,
      color: theme.text,
    },
    revenueValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    growthIndicator: {
      flexDirection: "row",
      alignItems: "center",
    },
    growthText: {
      fontSize: 14,
      marginLeft: 5,
    },
    cardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    card: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 10,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginHorizontal: 5,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginLeft: 5,
      flex: 1,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    cardStatus: {
      fontSize: 14,
      color: "#666",
      flexDirection: "row",
      alignItems: "center",
    },
    statusOverviewContainer: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginTop: 20,
      marginBottom: 20,
    },
    statusOverviewTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: theme.text,
    },
    statusRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statusColumn: {
      flex: 1,
      paddingHorizontal: 10,
    },
    statusColumnTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.text,
    },
    statusItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    statusLabel: {
      fontSize: 14,
      color: theme.text,
    },
    statusValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
    },
    statusValueGreen: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#2ECC71", // Green color for positive status
    },
    recentActivityContainer: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      marginTop: 20,
    },
    recentActivityHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    recentActivityTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },
    recentActivityFilter: {
      fontSize: 14,
      color: "#666",
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    activityIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#f0f0f0", // Light grey background for icon
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    activityDetails: {
      flex: 1,
    },
    activityHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 3,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginRight: 10,
    },
    activityStatus: {
      backgroundColor: "#e0e0e0", // Light grey background for status tag
      borderRadius: 5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      fontSize: 12,
      color: "#333",
    },
    activitySubtitle: {
      fontSize: 14,
      color: "#666",
      marginBottom: 3,
    },
    activityAmount: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
    },
    activityTime: {
      fontSize: 12,
      color: "#999",
      marginLeft: "auto",
    },
   attentionNeededContainer: {
     backgroundColor: "white",
     borderRadius: 10,
     padding: 15,
     shadowColor: "#000",
     shadowOffset: {
       width: 0,
       height: 2,
     },
     shadowOpacity: 0.1,
     shadowRadius: 3.84,
     elevation: 5,
     marginTop: 20,
     marginBottom: 20,
     borderLeftWidth: 5,
     borderLeftColor: "#FFC107", // Orange border for attention
   },
   attentionNeededHeader: {
     flexDirection: "row",
     alignItems: "center",
     marginBottom: 15,
   },
   attentionNeededTitle: {
     fontSize: 18,
     fontWeight: "bold",
     color: theme.text,
     marginLeft: 10,
   },
   attentionItem: {
     flexDirection: "row",
     justifyContent: "space-between",
     alignItems: "center",
     marginBottom: 10,
   },
   attentionText: {
     fontSize: 16,
     color: theme.text,
   },
   reviewButton: {
     backgroundColor: "#f0f0f0",
     borderRadius: 5,
     paddingVertical: 8,
     paddingHorizontal: 15,
   },
   reviewButtonText: {
     fontSize: 14,
     color: theme.text,
     fontWeight: "bold",
   },
 });

