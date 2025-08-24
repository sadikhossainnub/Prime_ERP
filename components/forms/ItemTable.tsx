import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_KEY, API_SECRET, BASE_URL } from '../../constants/config';
import ItemRow, { ItemRowData } from './ItemRow';

interface ItemTableProps {
  items: ItemRowData[];
  onItemsChange: (items: ItemRowData[]) => void;
  editable?: boolean;
  showTotals?: boolean;
  showWarehouseField?: boolean;
}

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  onItemsChange,
  editable = true,
  showTotals = true,
  showWarehouseField = true
}) => {
  const themedStyles = useThemedStyles();

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
      warehouse: '',
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
    <View style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Text style={themedStyles.title}>Items</Text>
        {editable && (
          <TouchableOpacity onPress={handleAddItem} style={themedStyles.addButton}>
            <Text style={themedStyles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        )}
      </View>

      {validationErrors.length > 0 && (
        <View style={themedStyles.errorContainer}>
          <Text style={themedStyles.errorTitle}>Please fix the following errors:</Text>
          {validationErrors.map((error, index) => (
            <Text key={index} style={themedStyles.errorText}>• {error}</Text>
          ))}
        </View>
      )}

      <ScrollView style={themedStyles.scrollView} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={themedStyles.emptyState}>
            <Text style={themedStyles.emptyStateText}>No items added yet</Text>
            {editable && (
              <TouchableOpacity onPress={handleAddItem} style={themedStyles.emptyStateButton}>
                <Text style={themedStyles.emptyStateButtonText}>Add First Item</Text>
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
              showWarehouseField={showWarehouseField}
            />
          ))
        )}
      </ScrollView>

      {showTotals && items.length > 0 && (
        <View style={themedStyles.totalsContainer}>
          <Text style={themedStyles.totalsTitle}>Summary</Text>
          
          <View style={themedStyles.totalRow}>
            <Text style={themedStyles.totalLabel}>Total Quantity:</Text>
            <Text style={themedStyles.totalValue}>{totalQty}</Text>
          </View>
          
          <View style={themedStyles.totalRow}>
            <Text style={themedStyles.totalLabel}>Total Amount:</Text>
            <Text style={themedStyles.totalAmount}>৳{totalAmount.toFixed(2)}</Text>
          </View>
          
          <View style={themedStyles.separator} />
          
          {/* Additional totals can be added here like tax, grand total, etc. */}
          <View style={themedStyles.totalRow}>
            <Text style={[themedStyles.totalLabel, themedStyles.grandTotalLabel]}>Grand Total:</Text>
            <Text style={[themedStyles.totalAmount, themedStyles.grandTotalAmount]}>
              ৳{totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {editable && items.length > 0 && (
        <TouchableOpacity onPress={handleAddItem} style={themedStyles.addMoreButton}>
          <Text style={themedStyles.addMoreButtonText}>+ Add Another Item</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const useThemedStyles = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const errorBackgroundColor = useThemeColor({ light: '#fff5f5', dark: '#4d1f1f' }, 'background');
  const errorBorderColor = useThemeColor({ light: '#fed7d7', dark: '#a52a2a' }, 'icon');
  const errorTextColor = useThemeColor({ light: '#e53e3e', dark: '#ff6b6b' }, 'text');

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: tintColor,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: textColor,
    },
    addButton: {
      backgroundColor: tintColor,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    addButtonText: {
      color: useThemeColor({ light: '#fff', dark: '#000' }, 'text'),
      fontSize: 14,
      fontWeight: '500',
    },
    errorContainer: {
      backgroundColor: errorBackgroundColor,
      borderWidth: 1,
      borderColor: errorBorderColor,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: errorTextColor,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      color: errorTextColor,
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
      borderColor: borderColor,
      borderStyle: 'dashed',
      borderRadius: 12,
      backgroundColor: useThemeColor({ light: '#f8f9fa', dark: '#2c2c2e' }, 'background'),
    },
    emptyStateText: {
      fontSize: 16,
      color: textColor,
      marginBottom: 16,
    },
    emptyStateButton: {
      backgroundColor: tintColor,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: useThemeColor({ light: '#fff', dark: '#000' }, 'text'),
      fontSize: 16,
      fontWeight: '500',
    },
    totalsContainer: {
      backgroundColor: useThemeColor({ light: '#f8f9fa', dark: '#2c2c2e' }, 'background'),
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: borderColor,
    },
    totalsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
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
      color: textColor,
    },
    totalValue: {
      fontSize: 14,
      fontWeight: '500',
      color: textColor,
    },
    totalAmount: {
      fontSize: 14,
      fontWeight: '500',
      color: tintColor,
    },
    separator: {
      height: 1,
      backgroundColor: borderColor,
      marginVertical: 8,
    },
    grandTotalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: textColor,
    },
    grandTotalAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: useThemeColor({ light: '#28a745', dark: '#2ecc71' }, 'tint'),
    },
    addMoreButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: tintColor,
      borderStyle: 'dashed',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    addMoreButtonText: {
      color: tintColor,
      fontSize: 14,
      fontWeight: '500',
    },
  });
};

export default ItemTable;
