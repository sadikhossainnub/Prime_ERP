import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";


const modules: { name: string; label: string; icon: React.ComponentProps<typeof IconSymbol>['name'] }[] = [
  { name: "Selling", label: "Selling", icon: "cart" },
  { name: "Stock", label: "Stock", icon: "archive" },
  { name: "CRM", label: "CRM", icon: "users" },
  { name: "Accounts", label: "Accounts", icon: "dollar-sign" },
  { name: "HRM", label: "HRM", icon: "briefcase" },
];

export default function ModuleScreen() {
  const router = useRouter();

  const handleCardPress = (moduleName: string) => {
    console.log(`Card pressed: ${moduleName}`);
    // You can add navigation logic here, for example:
    // router.push(`/modules/${moduleName.toLowerCase()}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Modules
      </ThemedText>
      <FlatList
        data={modules}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleCardPress(item.name)}
          >
            <IconSymbol name={item.icon} size={40} color="#333" />
            <ThemedText style={styles.cardText}>{item.label}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 150,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
