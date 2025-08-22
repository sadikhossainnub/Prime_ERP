import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_KEY, API_SECRET, BASE_URL } from '../../constants/config';
import ItemRow, { ItemRowData } from './ItemRow';

interface ItemTableProps {
  items: ItemRowData[];
  onItemsChange: (items: ItemRowData[]) => void;
  editable?: boolean;
  showTotals?: boolean;
}

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  onItemsChange,
  editable = true,
  showTotals = true
}) => {
  const handleItemChange = async (index: number, field: keyof ItemRowData, value: any) => {
    const updatedItems = [...items];
    const currentItem = { ...updatedItems[index], [field]: value };
    updatedItems[index] = currentItem;

    if (field === 'item_code' && value) {
      try {
        // Fetch item details
        const itemResponse = await fetch(`${BASE_URL}/api/resource/Item/${value}`, {
          headers: { 'Authorization': `token ${API_KEY}:${API_SECRET}` },
        });
        if (itemResponse.ok) {
          const itemResult = await itemResponse.json();
          const itemData = itemResult.data;
          currentItem.item_name = itemData.item_name;
          currentItem.description = itemData.description;
          currentItem.uom = itemData.stock_uom;
        } else {
          throw new Error('Failed to fetch item details');
        }

        // Fetch item price
        const priceResponse = await fetch(`${BASE_URL}/api/resource/Item Price?fields=["price_list_rate"]&filters=[["item_code","=","${value}"]]`, {
          headers: { 'Authorization': `token ${API_KEY}:${API_SECRET}` },
        });
        if (priceResponse.ok) {
          const priceResult = await priceResponse.json();
          if (priceResult.data && priceResult.data.length > 0) {
            currentItem.rate = priceResult.data[0].price_list_rate;
            currentItem.rate_fetched = true;
          } else {
            currentItem.rate = 0;
            currentItem.rate_fetched = false;
          }
        } else {
          currentItem.rate = 0;
          currentItem.rate_fetched = false;
          Alert.alert('Warning', 'Could not fetch item price. Please enter manually.');
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
        Alert.alert('Error', 'Failed to fetch item details or price.');
      }
    }

    // Recalculate amount
    if (['qty', 'rate'].includes(field) || (field === 'item_code' && value)) {
      const qty = Number(currentItem.qty) || 0;
      const rate = Number(currentItem.rate) || 0;
      currentItem.amount = qty * rate;
    }

    onItemsChange(updatedItems);
  };

  const handleAddItem = () => {
    const newItem: ItemRowData = {
      item_code: '',
      item_name: '',
      description: '',
      qty: 1,
      uom: '',
      rate: 0,
      amount: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  const calculateTotals = () => {
    const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { totalQty, totalAmount };
  };

  const { totalQty, totalAmount } = calculateTotals();

  const validateItems = () => {
    const errors: string[] = [];
    
    items.forEach((item, index) => {
      if (!item.item_code) {
        errors.push(`Item ${index + 1}: Item code is required`);
      }
      if (!item.qty || item.qty <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.rate || item.rate < 0) {
        errors.push(`Item ${index + 1}: Rate must be greater than or equal to 0`);
      }
    });
    
    return errors;
  };

  const validationErrors = validateItems();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Items</Text>
        {editable && (
          <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        )}
      </View>

      {validationErrors.length > 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Please fix the following errors:</Text>
          {validationErrors.map((error, index) => (
            <Text key={index} style={styles.errorText}>• {error}</Text>
          ))}
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items added yet</Text>
            {editable && (
              <TouchableOpacity onPress={handleAddItem} style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>Add First Item</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          items.map((item, index) => (
            <ItemRow
              key={index}
              index={index}
              item={item}
              onItemChange={handleItemChange}
              onRemove={handleRemoveItem}
              showRemoveButton={editable && items.length > 1}
            />
          ))
        )}
      </ScrollView>

      {showTotals && items.length > 0 && (
        <View style={styles.totalsContainer}>
          <Text style={styles.totalsTitle}>Summary</Text>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Quantity:</Text>
            <Text style={styles.totalValue}>{totalQty}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>৳{totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.separator} />
          
          {/* Additional totals can be added here like tax, grand total, etc. */}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotalLabel]}>Grand Total:</Text>
            <Text style={[styles.totalAmount, styles.grandTotalAmount]}>
              ৳{totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {editable && items.length > 0 && (
        <TouchableOpacity onPress={handleAddItem} style={styles.addMoreButton}>
          <Text style={styles.addMoreButtonText}>+ Add Another Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fed7d7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e53e3e',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#e53e3e',
    marginBottom: 2,
  },
  scrollView: {
    flex: 1,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  totalsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  totalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007BFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  addMoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007BFF',
    borderStyle: 'dashed',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addMoreButtonText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ItemTable;
