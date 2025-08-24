import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from "react-native";


const modules: { name: string; label: string; icon: React.ComponentProps<typeof IconSymbol>['name'] }[] = [
  { name: "Selling", label: "Selling", icon: "cart" },
  { name: "Stock", label: "Stock", icon: "archive" },
  { name: "CRM", label: "CRM", icon: "users" },
  { name: "Accounts", label: "Accounts", icon: "banknote.fill" },
  { name: "HRM", label: "HRM", icon: "briefcase" },
];

export default function ModuleScreen() {
  const router = useRouter();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const cardBackgroundColor = useThemeColor({}, "moduleCardBackground");
  const cardTextColor = useThemeColor({}, "moduleCardText");
  const iconColor = useThemeColor({}, "icon");

  const handleCardPress = (moduleName: string) => {
    console.log("handleCardPress called with moduleName:", moduleName);
    if (moduleName === "Selling") {
      console.log("Navigating to /(tabs)/sellingmodulemenu");
      router.push("/(tabs)/sellingmodulemenu");
    } else {
      setSelectedModule(moduleName);
    }
  };

  if (selectedModule) {
    return (
      <ThemedView style={styles.container}>
        <Button title="Back" onPress={() => setSelectedModule(null)} />
      </ThemedView>
    );
  }

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
            style={[styles.card, { backgroundColor: cardBackgroundColor }]}
            onPress={() => handleCardPress(item.name)}
          >
            <IconSymbol name={item.icon} size={40} color={iconColor} />
            <ThemedText style={[styles.cardText, { color: cardTextColor }]}>
              {item.label}
            </ThemedText>
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
