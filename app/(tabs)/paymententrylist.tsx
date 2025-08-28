import FilterModal from '@/components/FilterModal';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { apiRequest } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { AxiosRequestConfig } from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PaymentEntry {
  name: string;
  party_type: string;
  party: string;
  paid_amount: number;
  docstatus: number;
}

const PaymentEntryListScreen = () => {
  const router = useRouter();
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPaymentEntries, setFilteredPaymentEntries] = useState<PaymentEntry[]>([]);
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
    const fetchPaymentEntries = async () => {
      try {
        const formattedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) {
            let fieldName = key;
            let operator = 'like'; // Default operator

            if (key === 'party') {
              fieldName = 'party';
            } else if (key === 'docstatus') {
              fieldName = 'docstatus';
              operator = '=';
            }
            acc.push(['Payment Entry', fieldName, operator, value]);
          }
          return acc;
        }, [] as Array<[string, string, string, any]>);

        const apiOptions: AxiosRequestConfig = {
          params: {
            fields: '["name", "party_type", "party", "paid_amount", "docstatus"]',
            order_by: 'creation desc',
          },
        };

        if (formattedFilters.length > 0) {
          apiOptions.params.filters = JSON.stringify(formattedFilters);
        }

        const response = await apiRequest('Payment Entry', apiOptions);
        setPaymentEntries(response.data);
      } catch (error) {
        console.error('Failed to fetch payment entries:', error);
      }
    };

    fetchPaymentEntries();
  }, [filters]);

  useEffect(() => {
    let filtered = paymentEntries;

    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.party.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPaymentEntries(filtered);
  }, [searchQuery, paymentEntries, filters]);

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
    cardBackground: cardBackgroundColor,
    tint: tintColor,
    icon: iconColor,
  });
  
  const getStatus = (docstatus: number) => {
    if (docstatus === 0) return 'Draft';
    if (docstatus === 1) return 'Submitted';
    if (docstatus === 2) return 'Cancelled';
    return 'Unknown';
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Entry List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/paymententryform')}
        >
          <Text style={styles.addButtonText}>+ Add Payment Entry</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Payment Entries"
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
        data={filteredPaymentEntries}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/paymententryform', params: { name: item.name, mode: 'view' } })}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Name: {item.name}</Text>
              <Text style={styles.cardText}>Party: {item.party} ({item.party_type})</Text>
              <Text style={styles.cardText}>Paid Amount: {item.paid_amount}</Text>
              <Text style={[styles.cardText, styles.statusStyle, { color: item.docstatus === 0 ? 'gray' : item.docstatus === 1 ? 'blue' : 'red' }]}>
                Status: {getStatus(item.docstatus)}</Text>
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

export default PaymentEntryListScreen;