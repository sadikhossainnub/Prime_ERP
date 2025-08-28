import FilterModal from '@/components/FilterModal';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { apiRequest } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { AxiosRequestConfig } from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DeliveryNote {
  name: string;
  customer_name: string;
  grand_total: number;
  status: string;
}

const DeliveryNoteListScreen = () => {
  const router = useRouter();
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDeliveryNotes, setFilteredDeliveryNotes] = useState<DeliveryNote[]>([]);
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
    const fetchDeliveryNotes = async () => {
      try {
        const formattedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) {
            let fieldName = key;
            let operator = 'like'; // Default operator

            if (key === 'customerName') {
              fieldName = 'customer_name';
            } else if (key === 'status') {
              fieldName = 'status';
            }
            acc.push(['Delivery Note', fieldName, operator, value]);
          }
          return acc;
        }, [] as Array<[string, string, string, any]>);

        const apiOptions: AxiosRequestConfig = {
          params: {
            fields: '["name", "customer_name", "grand_total", "status"]',
            order_by: 'creation desc',
          },
        };

        if (formattedFilters.length > 0) {
          apiOptions.params.filters = JSON.stringify(formattedFilters);
        }

        const response = await apiRequest('Delivery Note', apiOptions);
        setDeliveryNotes(response.data);
      } catch (error) {
        console.error('Failed to fetch delivery notes:', error);
      }
    };

    fetchDeliveryNotes();
  }, [filters]);

  useEffect(() => {
    let filtered = deliveryNotes;

    if (searchQuery) {
      filtered = filtered.filter((note) =>
        note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.customerName) {
      filtered = filtered.filter((note) =>
        note.customer_name.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((note) =>
        note.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredDeliveryNotes(filtered);
  }, [searchQuery, deliveryNotes, filters]);

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
        <Text style={styles.title}>Delivery Note List</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/deliverynoteform')}
        >
          <Text style={styles.addButtonText}>+ Add Delivery Note</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Delivery Notes"
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
        data={filteredDeliveryNotes}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/deliverynoteform', params: { name: item.name, mode: 'view' } })}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Name: {item.name}</Text>
              <Text style={styles.cardText}>Customer: {item.customer_name}</Text>
              <Text style={styles.cardText}>Total: {item.grand_total}</Text>
              <Text style={[styles.cardText, styles.statusStyle, { color: item.status === 'Draft' ? 'gray' : item.status === 'Submitted' ? 'blue' : 'green' }]}>
                Status: {item.status}</Text>
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

export default DeliveryNoteListScreen;