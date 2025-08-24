import FilterModal from '@/components/FilterModal';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { apiRequest } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Item {
  name: string;
  item_code: string;
  description: string;
}

const ItemListScreen = () => {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await apiRequest('Item?fields=["name", "item_code", "description"]');
        setItems(response.data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Add filter logic for items here if needed

    setFilteredItems(filtered);
  }, [searchQuery, items, filters]);

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
    cardBackground: cardBackgroundColor,
    tint: tintColor,
    icon: iconColor,
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Item List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/itemform')}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Items"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={iconColor}
        />
        <TouchableOpacity style={styles.searchIcon} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color={iconColor} />
        </TouchableOpacity>
      </View>
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={handleApplyFilters}
      />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/itemform', params: { name: item.name, mode: 'view' } })}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Name: {item.name}</Text>
              <Text style={styles.cardText}>Item Code: {item.item_code}</Text>
              <Text style={styles.cardText}>Description: {item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

const getStyles = (theme: {
  background: string;
  text: string;
  cardBackground: string;
  tint: string;
  icon: string;
}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 30,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      flex: 1,
      color: theme.text,
    },
    addButton: {
      backgroundColor: theme.tint,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.text,
    },
    cardText: {
      fontSize: 16,
      color: theme.text,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      height: 40,
      borderColor: theme.icon,
      borderWidth: 1,
      paddingHorizontal: 8,
      borderRadius: 8,
      color: theme.text,
    },
    searchIcon: {
      marginLeft: 8,
    },
  });

export default ItemListScreen;
