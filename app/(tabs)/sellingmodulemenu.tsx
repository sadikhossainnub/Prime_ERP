import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import React from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";

interface Module {
  name: string;
  label: string;
  icon: IconSymbolName;
}

const modules: Module[] = [
  { name: "Quotations", label: "Quotations", icon: "paperplane.fill" },
  { name: "Orders", label: "Orders", icon: "paperplane.fill" },
  { name: "Customers", label: "Customers", icon: "users" },
  { name: "Items", label: "Items", icon: "archive" },
];

const SellingModuleMenu = () => {
  console.log("SellingModuleMenu component rendered");
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Selling
      </ThemedText>
      <FlatList
        data={modules}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {}}
          >
            <IconSymbol name={item.icon} size={40} color="#333" />
            <ThemedText style={styles.cardText}>{item.label}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    marginTop: 30,
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

export default SellingModuleMenu;
