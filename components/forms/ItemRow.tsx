import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinkField from './LinkField';

export interface ItemRowData {
  item_code?: string;
  item_name?: string;
  description?: string;
  qty?: number;
  uom?: string;
  rate?: number;
  amount?: number;
  warehouse?: string;
  rate_fetched?: boolean;
}

interface ItemRowProps {
  index: number;
  item: ItemRowData;
  onItemChange: (index: number, field: keyof ItemRowData, value: any) => void;
  onRemove: (index: number) => void;
  showRemoveButton?: boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({
  index,
  item,
  onItemChange,
  onRemove,
  showRemoveButton = true
}) => {
  const handleFieldChange = (field: keyof ItemRowData, value: any) => {
    onItemChange(index, field, value);
  };

  const handleItemCodeChange = (value: any) => {
    handleFieldChange('item_code', value);
  };

  const handleQtyChange = (value: string) => {
    const qty = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    handleFieldChange('qty', qty);
  };

  const handleRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    handleFieldChange('rate', rate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Item {index + 1}</Text>
        {showRemoveButton && (
          <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Item Code *</Text>
          <LinkField
            doctype="Item"
            value={item.item_code || ''}
            onChangeValue={handleItemCodeChange}
            placeholder="Select Item"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={item.item_name || ''}
            editable={false}
            placeholder="Item name will appear here"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput, styles.textArea]}
            value={item.description || ''}
            editable={false}
            multiline
            numberOfLines={3}
            placeholder="Item description"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldContainer, styles.halfWidth]}>
          <Text style={styles.label}>Quantity *</Text>
          <TextInput
            style={styles.input}
            value={item.qty?.toString() || ''}
            onChangeText={handleQtyChange}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={[styles.fieldContainer, styles.halfWidth]}>
          <Text style={styles.label}>UOM</Text>
          <LinkField
            doctype="UOM"
            value={item.uom || ''}
            onChangeValue={(value: string) => handleFieldChange('uom', value)}
            placeholder="Select UOM"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.fieldContainer, styles.halfWidth]}>
          <Text style={styles.label}>Rate *</Text>
          <TextInput
            style={[styles.input, item.rate_fetched && styles.readOnlyInput]}
            value={item.rate?.toString() || ''}
            editable={!item.rate_fetched}
            onChangeText={handleRateChange}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>

        <View style={[styles.fieldContainer, styles.halfWidth]}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={item.amount?.toFixed(2) || '0.00'}
            editable={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Warehouse</Text>
          <LinkField
            doctype="Warehouse"
            value={item.warehouse || ''}
            onChangeValue={(value: string) => handleFieldChange('warehouse', value)}
            placeholder="Select Warehouse"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  fieldContainer: {
    flex: 1,
  },
  halfWidth: {
    flex: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default ItemRow;
