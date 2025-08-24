import FilterModal from '@/components/FilterModal';
import { ThemedView } from '@/components/ThemedView';
import { ItemRowData } from '@/components/forms/ItemRow';
import { useThemeColor } from '@/hooks/useThemeColor';
import { apiRequest } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Quotation {
  name: string;
  customer_name: string;
  items: ItemRowData[];
  grand_total: number;
  status: string;
    transaction_date: string;
  valid_till: string;
  td_date: string;
}

const QuotationListScreen = () => {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
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
    const fetchQuotations = async () => {
      try {
        const fields = JSON.stringify([
          "name", "customer_name", "grand_total", "status", "transaction_date", "valid_till", "td_date"
        ]);
        const endpoint = `Quotation?fields=${encodeURIComponent(fields)}`;
        const response = await apiRequest(endpoint);
        setQuotations(response.data);
      } catch (error) {
        console.error('Failed to fetch quotations:', error);
        Alert.alert('Error', 'Failed to fetch quotations. Please check your connection and try again.');
      }
    };

    fetchQuotations();
  }, []);

  useEffect(() => {
    let filtered = quotations;

    if (searchQuery) {
      filtered = filtered.filter((quotation) =>
        quotation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.customerName) {
      filtered = filtered.filter((quotation) =>
        quotation.customer_name.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((quotation) =>
        quotation.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.date) {
      filtered = filtered.filter((quotation) =>
        quotation.transaction_date === filters.date
      );
    }

    setFilteredQuotations(filtered);
  }, [searchQuery, quotations, filters]);

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
        <Text style={styles.title}>Quotation List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/quotationform')}
        >
          <Text style={styles.addButtonText}>+ Add Quotation</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Quotations"
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
        data={filteredQuotations}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/quotationform', params: { name: item.name, mode: 'view' } })}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Name: {item.name}</Text>
              <Text style={styles.cardText}>Customer: {item.customer_name}</Text>
              <Text style={styles.cardText}>Total: {item.grand_total}</Text>
              <Text style={styles.cardText}>Date: {item.transaction_date}</Text>
              <Text style={styles.cardText}>Valid Till: {item.valid_till}</Text>
              <Text style={styles.cardText}>TD Date: {item.td_date}</Text>
              <Text style={[styles.cardText, styles.statusStyle, { color: item.status === 'Draft' ? 'gray' : item.status === 'Submitted' ? 'blue' : 'green' }]}>
                Status: {item.status}
              </Text>
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
    statusStyle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default QuotationListScreen;
