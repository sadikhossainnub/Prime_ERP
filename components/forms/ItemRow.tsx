import { useThemeColor } from '@/hooks/useThemeColor';
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
  rate_fetched?: boolean;
  warehouse?: string;
}

interface ItemRowProps {
  index: number;
  item: ItemRowData;
  onItemChange: (index: number, field: keyof ItemRowData, value: any) => void;
  onRemove: (index: number) => void;
  showRemoveButton?: boolean;
  showWarehouseField?: boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({
  index,
  item,
  onItemChange,
  onRemove,
  showRemoveButton = true,
  showWarehouseField = true
}) => {
  const themedStyles = useThemedStyles();

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
    <View style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Text style={themedStyles.headerText}>Item {index + 1}</Text>
        {showRemoveButton && (
          <TouchableOpacity onPress={() => onRemove(index)} style={themedStyles.removeButton}>
            <Text style={themedStyles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={themedStyles.row}>
        <View style={themedStyles.fieldContainer}>
          <Text style={themedStyles.label}>Item Code *</Text>
          <LinkField
            doctype="Item"
            fieldname="item_code"
            value={item.item_code || ''}
            onChangeValue={handleItemCodeChange}
            placeholder="Select Item"
          />
        </View>
      </View>

      <View style={themedStyles.row}>
        <View style={themedStyles.fieldContainer}>
          <Text style={themedStyles.label}>Item Name</Text>
          <TextInput
            style={[themedStyles.input, themedStyles.readOnlyInput]}
            value={item.item_name || ''}
            editable={false}
            placeholder="Item name will appear here"
          />
        </View>
      </View>

      <View style={themedStyles.row}>
        <View style={themedStyles.fieldContainer}>
          <Text style={themedStyles.label}>Description</Text>
          <TextInput
            style={[themedStyles.input, themedStyles.readOnlyInput, themedStyles.textArea]}
            value={item.description || ''}
            editable={false}
            multiline
            numberOfLines={3}
            placeholder="Item description"
          />
        </View>
      </View>

      <View style={themedStyles.row}>
        <View style={[themedStyles.fieldContainer, themedStyles.halfWidth]}>
          <Text style={themedStyles.label}>Quantity *</Text>
          <TextInput
            style={themedStyles.input}
            value={item.qty?.toString() || ''}
            onChangeText={handleQtyChange}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={[themedStyles.fieldContainer, themedStyles.halfWidth]}>
          <Text style={themedStyles.label}>UOM</Text>
          <LinkField
            doctype="UOM"
            fieldname="uom"
            value={item.uom || ''}
            onChangeValue={(value: string) => handleFieldChange('uom', value)}
            placeholder="Select UOM"
          />
        </View>
      </View>

      <View style={themedStyles.row}>
        <View style={[themedStyles.fieldContainer, themedStyles.halfWidth]}>
          <Text style={themedStyles.label}>Rate *</Text>
          <TextInput
            style={[themedStyles.input, item.rate_fetched && themedStyles.readOnlyInput]}
            value={item.rate?.toString() || ''}
            editable={!item.rate_fetched}
            onChangeText={handleRateChange}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>

        <View style={[themedStyles.fieldContainer, themedStyles.halfWidth]}>
          <Text style={themedStyles.label}>Amount</Text>
          <TextInput
            style={[themedStyles.input, themedStyles.readOnlyInput]}
            value={`৳${item.amount?.toFixed(2) || '0.00'}`}
            editable={false}
          />
        </View>
      </View>

      {showWarehouseField && (
        <View style={themedStyles.row}>
          <View style={themedStyles.fieldContainer}>
            <Text style={themedStyles.label}>Warehouse</Text>
            <LinkField
              doctype="Warehouse"
              fieldname="warehouse"
              value={item.warehouse || ''}
              onChangeValue={(value: string) => handleFieldChange('warehouse', value)}
              placeholder="Select Warehouse"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const useThemedStyles = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');
  const readOnlyBackgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#2c2c2e' }, 'background');
  const readOnlyTextColor = useThemeColor({ light: '#6c757d', dark: '#a0a0a0' }, 'text');

  return StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      backgroundColor: backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
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
      color: textColor,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: borderColor,
      borderRadius: 6,
      padding: 12,
      fontSize: 16,
      backgroundColor: backgroundColor,
      color: textColor,
    },
    readOnlyInput: {
      backgroundColor: readOnlyBackgroundColor,
      color: readOnlyTextColor,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });
};

export default ItemRow;
