
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_KEY, API_SECRET, BASE_URL } from '../../constants/config';
import { Doctype } from '../../types/doctypes';
import StyledButton from '../ui/StyledButton';
import DynamicField from './DynamicField';
import { ItemRowData } from './ItemRow';
import ItemTable from './ItemTable';

interface QuotationFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit' | 'view';
}

interface FormSection {
  title: string;
  fields: Doctype[];
}

const numberToWords = (num: number): string => {
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
    'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  const numStr = num.toString();
  if (numStr.length > 9) return 'overflow';
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + ' crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + ' lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + ' thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + ' hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  return str.trim();
};

const QuotationForm: React.FC<QuotationFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const router = useRouter();
  const [fields, setFields] = useState<Doctype[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [items, setItems] = useState<ItemRowData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const isViewMode = mode === 'view';

  useEffect(() => {
    fetchFields();
    // Initialize with one empty item if no items in initialData
    if (initialData.items && Array.isArray(initialData.items)) {
      setItems(initialData.items);
    } else {
      setItems([
        {
        item_code: '',
        item_name: '',
        description: '',
        qty: 1,
        uom: '',
        rate: 0,
        amount: 0,
      }
      ]);
    }
  }, []);

  const fetchFields = () => {
    setFieldsLoading(true);
    const quotationFields: Doctype[] = [
      {
        "name": "title", "label": "Title", "fieldname": "title", "fieldtype": "Data", "options": "", "default": "{customer_name}",
        "mandatory": 0, "read_only": 0, "hidden": 1, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 1, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "no_copy": 1, "print_hide": 1
      },
      {
        "name": "party_name", "label": "Party", "fieldname": "party_name", "fieldtype": "Link", "options": "Customer", "default": "",
        "mandatory": 0, "read_only": 0, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "bold": 1, "in_global_search": 1, "in_standard_filter": 1, "print_hide": 1, "search_index": 1
      },
      {
        "name": "customer_name", "label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "options": "", "default": "",
        "mandatory": 0, "read_only": 1, "hidden": 1, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "bold": 1, "in_global_search": 1
      },
      {
        "name": "transaction_date", "label": "Date", "fieldname": "transaction_date", "fieldtype": "Date", "options": "", "default": "Today",
        "mandatory": 1, "read_only": 0, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 1, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "no_copy": 1, "in_standard_filter": 1, "reqd": 1, "search_index": 1, "width": "100px"
      },
      {
        "name": "valid_till", "label": "Valid Till", "fieldname": "valid_till", "fieldtype": "Date", "options": "", "default": "",
        "mandatory": 0, "read_only": 0, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0
      },
      {
        "name": "td_date", "label": "Tentative Delivery Date", "fieldname": "td_date", "fieldtype": "Date", "options": "", "default": "",
        "mandatory": 0, "read_only": 0, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0
      },
      {
        "name": "order_type", "label": "Order Type", "fieldname": "order_type", "fieldtype": "Select", "options": "\nSales\nMaintenance\nShopping Cart", "default": "Sales",
        "mandatory": 1, "read_only": 0, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "in_standard_filter": 1, "print_hide": 1, "reqd": 1
      },
      {
        "name": "total_qty", "label": "Total Quantity", "fieldname": "total_qty", "fieldtype": "Float", "options": "", "default": "",
        "mandatory": 0, "read_only": 1, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0
      },
      {
        "name": "grand_total", "label": "Grand Total", "fieldname": "grand_total", "fieldtype": "Currency", "options": "currency", "default": "",
        "mandatory": 0, "read_only": 1, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 1, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "width": "200px"
      },
      {
        "name": "in_words", "label": "In Words", "fieldname": "in_words", "fieldtype": "Data", "options": "", "default": "",
        "mandatory": 0, "read_only": 1, "hidden": 0, "depends_on": "", "description": "", "length": 240, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "print_hide": 1, "width": "200px"
      }
    ] as Doctype[];
    const filteredFields = quotationFields.filter((field: Doctype) =>
      !['name', 'owner', 'creation', 'modified', 'modified_by', 'docstatus', 'idx', 'items'].includes(field.fieldname) &&
      !field.fieldname.startsWith('item_') // Exclude item-related fields
    ).sort((a: any, b: any) => (a.idx || 0) - (b.idx || 0));
    
    setFields(filteredFields);
    setFieldsLoading(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate regular form fields
    fields.forEach(field => {
      if (field.mandatory === 1) {
        const value = formData[field.fieldname];
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.fieldname] = `${field.label} is required`;
        }
      }
    });

    // Validate items
    if (items.length === 0) {
      newErrors['items'] = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        if (!item.item_code) {
          newErrors[`item_${index}_code`] = `Item ${index + 1}: Item code is required`;
        }
        if (!item.qty || item.qty <= 0) {
          newErrors[`item_${index}_qty`] = `Item ${index + 1}: Quantity must be greater than 0`;
        }
        if (item.rate === undefined || item.rate < 0) {
          newErrors[`item_${index}_rate`] = `Item ${index + 1}: Rate must be greater than or equal to 0`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      // Prepare data with items
      const submissionData = {
        ...formData,
        items: items.map(item => ({
          item_code: item.item_code,
          item_name: item.item_name,
          description: item.description,
          qty: item.qty,
          uom: item.uom,
          rate: item.rate,
          amount: item.amount,
        }))
      };

      const endpoint = mode === 'create' ? 'Quotation' : `Quotation/${initialData.name || formData.name}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(`${BASE_URL}/api/resource/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${API_KEY}:${API_SECRET}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${mode} Quotation`);
      }

      const responseData = await response.json();

      Alert.alert(
        'Success',
        `Quotation ${mode === 'create' ? 'created' : 'updated'} successfully!`, 
        [{ text: 'OK', onPress: () => onSuccess?.(responseData.data) }]
      );
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} Quotation:`, error);
      Alert.alert('Error', `Failed to ${mode} Quotation. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (fieldname: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldname]: value }));
    
    // Clear error for this field
    if (errors[fieldname]) {
      setErrors(prev => ({ ...prev, [fieldname]: '' }));
    }
  };

  const handleItemsChange = (updatedItems: ItemRowData[]) => {
    setItems(updatedItems);

    const totalQty = updatedItems.reduce((sum, item) => sum + (item.qty || 0), 0);
    const grandTotal = updatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const inWords = numberToWords(grandTotal);
    setFormData(prev => ({
      ...prev,
      total_qty: totalQty,
      grand_total: grandTotal,
      total: grandTotal,
      net_total: grandTotal,
      in_words: inWords
    }));
    
    // Clear item-related errors
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('item_') || key === 'items') {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };

  const handleCreateSalesOrder = () => {
    router.push({
      pathname: '/(tabs)/salesorderform',
      params: {
        initialData: JSON.stringify({
          ...formData,
          items: items,
        }),
        mode: 'create',
      },
    });
  };

  const groupFieldsIntoSections = (fields: Doctype[]): FormSection[] => {
    const sections: FormSection[] = [];
    let currentSection: FormSection | null = null;
    
    fields.forEach(field => {
      let sectionTitle = 'General Information';
      
      if (field.fieldname.includes('address') || field.fieldname.includes('contact')) {
        sectionTitle = 'Address & Contact';
      } else if (field.fieldname.includes('tax') || field.fieldname.includes('discount') ||
                 field.fieldname.includes('currency') || field.fieldname.includes('price')) {
        sectionTitle = 'Pricing & Tax';
      } else if (field.fieldname.includes('terms') || field.fieldname.includes('note')) {
        sectionTitle = 'Terms & Conditions';
      }

      if (!currentSection || currentSection.title !== sectionTitle) {
        currentSection = { title: sectionTitle, fields: [] };
        sections.push(currentSection);
      }
      
      currentSection.fields.push(field);
    });

    return sections;
  };

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
    cardBackground: cardBackgroundColor,
    tint: tintColor,
    icon: iconColor,
  });

  if (fieldsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: textColor }}>Loading form...</Text>
      </View>
    );
  }

  const sections = groupFieldsIntoSections(fields);
  const generalInfoSection = sections.find(sec => sec.title === 'General Information');
  const otherSections = sections.filter(sec => sec.title !== 'General Information');

  const orderTypeIndex = generalInfoSection ? generalInfoSection.fields.findIndex(f => f.fieldname === 'order_type') : -1;

  const fieldsBeforeOrderType = generalInfoSection && orderTypeIndex !== -1 ? generalInfoSection.fields.slice(0, orderTypeIndex + 1) : generalInfoSection ? generalInfoSection.fields : [];
  const fieldsAfterOrderType = generalInfoSection && orderTypeIndex !== -1 ? generalInfoSection.fields.slice(orderTypeIndex + 1) : [];


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        {mode === 'create' ? 'Create Quotation' : mode === 'edit' ? 'Edit Quotation' : 'View Quotation'}
      </Text>

      {/* General Information Section */}
      {generalInfoSection && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{generalInfoSection.title}</Text>
          {fieldsBeforeOrderType.map((field) => (
            <DynamicField
              key={field.fieldname}
              field={field}
              value={formData[field.fieldname]}
              onChangeValue={updateField}
              error={errors[field.fieldname]}
              formData={formData}
              isViewMode={isViewMode}
            />
          ))}
        </View>
      )}

      {/* Items Section */}
      <View style={styles.section}>
        <ItemTable
          items={items}
          onItemsChange={handleItemsChange}
          editable={!isViewMode}
          showTotals={true}
        />
        {errors['items'] && <Text style={styles.errorText}>{errors['items']}</Text>}
      </View>

      {generalInfoSection && fieldsAfterOrderType.length > 0 && (
        <View style={styles.section}>
          {fieldsAfterOrderType.map((field) => (
            <DynamicField
              key={field.fieldname}
              field={field}
              value={formData[field.fieldname]}
              onChangeValue={updateField}
              error={errors[field.fieldname]}
              formData={formData}
              isViewMode={isViewMode}
            />
          ))}
        </View>
      )}

      {/* Other Form Sections */}
      {otherSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.fields.map((field) => (
            <DynamicField
              key={field.fieldname}
              field={field}
              value={formData[field.fieldname]}
              onChangeValue={updateField}
              error={errors[field.fieldname]}
              formData={formData}
              isViewMode={isViewMode}
            />
          ))}
        </View>
      ))}

      {/* Submit Buttons */}
      {!isViewMode && (
        <View style={styles.buttonContainer}>
          <StyledButton
            title={loading ? 'Processing...' : (mode === 'create' ? 'Create Quotation' : 'Update Quotation')}
            onPress={handleSubmit}
            style={[styles.submitButton, loading && styles.disabledButton]}
          />
          
          {onCancel && (
            <StyledButton
              title="Cancel"
              onPress={onCancel}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
          )}
          {mode === 'edit' && (
            <StyledButton
              title="Create Sales Order"
              onPress={handleCreateSalesOrder}
              style={styles.salesOrderButton}
            />
          )}
        </View>
      )}
    </ScrollView>
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
      backgroundColor: theme.background,
      marginTop: 30,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 24,
      textAlign: 'center',
      color: theme.text,
    },
    section: {
      marginBottom: 24,
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      color: theme.text,
    },
    errorText: {
      color: '#ff4757',
      fontSize: 14,
      marginTop: 4,
    },
    buttonContainer: {
      marginTop: 20,
      gap: 12,
    },
    submitButton: {
      backgroundColor: theme.tint,
    },
    disabledButton: {
      backgroundColor: theme.icon,
    },
    cancelButton: {
      backgroundColor: theme.icon,
    },
    cancelButtonText: {
      color: theme.text,
    },
    salesOrderButton: {
      backgroundColor: '#28a745',
    },
  });

export default QuotationForm;
