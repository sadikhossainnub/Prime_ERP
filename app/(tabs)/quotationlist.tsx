import { apiRequest } from '@/services/api';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

interface Quotation {
  name: string;
  customer_name: string;
  grand_total: number;
  status: string;
}

const QuotationListScreen = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await apiRequest('Quotation?fields=["name", "customer_name", "grand_total", "status"]');
        setQuotations(response.data);
      } catch (error) {
        console.error('Failed to fetch quotations:', error);
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
      <Text style={styles.title}>Quotation List</Text>
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Name: {item.name}</Text>
            <Text style={styles.cardText}>Customer: {item.customer_name}</Text>
            <Text style={styles.cardText}>Total: {item.grand_total}</Text>
            <Text style={[styles.cardText, styles.statusStyle, { color: item.status === 'Draft' ? 'gray' : item.status === 'Submitted' ? 'blue' : 'green' }]}>
              Status: {item.status}
            </Text>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
