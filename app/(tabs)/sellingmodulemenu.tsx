import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
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
  hidden?: boolean;
}

const modules: Module[] = [
  { name: "Quotations", label: "Quotations", icon: "paperplane.fill" },
  { name: "Orders", label: "Orders", icon: "cart" },
  { name: "Customers", label: "Customers", icon: "users" },
  { name: "Items", label: "Items", icon: "archive" },
];

const SellingModuleMenu = () => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, "sellingCardBackground");
  const shadowColor = useThemeColor({}, "sellingCardShadow");
  const iconColor = useThemeColor({}, "sellingCardIcon");

  console.log("SellingModuleMenu component rendered");
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Selling
      </ThemedText>
      <FlatList
        data={modules.filter(item => !item.hidden)}
        keyExtractor={(item) => item.name}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { 
              backgroundColor: backgroundColor,
              shadowColor: shadowColor,
            }]}
            onPress={() => {
              switch (item.name) {
                case "Quotations":
                  router.push("/(tabs)/quotationlist");
                  break;
                case "Orders":
                  router.push("/(tabs)/orderlist");
                  break;
                case "Customers":
                  router.push("/(tabs)/customerlist");
                  break;
                case "Items":
                  router.push("/(tabs)/itemlist");
                  break;
              }
            }}
          >
            <IconSymbol name={item.icon} size={40} color={iconColor} />
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
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    minHeight: 150,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SellingModuleMenu;
