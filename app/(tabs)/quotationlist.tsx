import { ItemRowData } from '@/components/forms/ItemRow';
import { apiRequest } from '@/services/api';
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
    const filtered = quotations.filter((quotation) =>
      quotation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuotations(filtered);
  }, [searchQuery, quotations]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quotation List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/quotationform')}
        >
          <Text style={styles.addButtonText}>+ Add Quotation</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Quotations"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredQuotations}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={async () => {
              try {
                const response = await apiRequest(`Quotation/${item.name}`);
                router.push({
                  pathname: '/(tabs)/quotationform',
                  params: { initialData: JSON.stringify(response.data), mode: 'edit' },
                });
              } catch (error) {
                console.error('Failed to fetch quotation details:', error);
                Alert.alert('Error', 'Failed to fetch quotation details.');
              }
            }}
          >
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 30,
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
  },
  addButton: {
    backgroundColor: '#007BFF',
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
    backgroundColor: '#fff',
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
  },
  cardText: {
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusStyle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuotationListScreen;
