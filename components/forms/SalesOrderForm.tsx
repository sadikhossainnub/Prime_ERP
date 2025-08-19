import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_KEY, API_SECRET, BASE_URL } from '../../constants/config';
import { Doctype } from '../../types/doctypes';
import StyledButton from '../ui/StyledButton';
import DynamicField from './DynamicField';
import { ItemRowData } from './ItemRow';
import ItemTable from './ItemTable';

interface SalesOrderFormProps {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
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
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[parseInt(n[1][0], 10)] + ' ' + a[parseInt(n[1][1], 10)]) + ' crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[parseInt(n[2][0], 10)] + ' ' + a[parseInt(n[2][1], 10)]) + ' lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[parseInt(n[3][0], 10)] + ' ' + a[parseInt(n[3][1], 10)]) + ' thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[parseInt(n[4][0], 10)] + ' ' + a[parseInt(n[4][1], 10)]) + ' hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[parseInt(n[5][0], 10)] + ' ' + a[parseInt(n[5][1], 10)]) : '';
  
  return str.trim();
};

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  mode = 'create'
}) => {
  const [fields, setFields] = useState<Doctype[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [items, setItems] = useState<ItemRowData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(true);

  useEffect(() => {
    fetchFields();
    if (initialData && Object.keys(initialData).length > 0) {
      const mappedData = { ...initialData };
      if (mappedData.party_name) {
        mappedData.customer = mappedData.party_name;
        delete mappedData.party_name;
      }
      setFormData(mappedData);

      if (initialData.items && Array.isArray(initialData.items)) {
        setItems(initialData.items);
      }
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
          warehouse: '',
        },
      ]);
    }
  }, [initialData]);

  const fetchFields = () => {
    setFieldsLoading(true);
    const salesOrderFields: Doctype[] = [
      {
        "name": "title", "label": "Title", "fieldname": "title", "fieldtype": "Data", "options": "", "default": "{customer_name}",
        "mandatory": 0, "read_only": 0, "hidden": 1, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 1, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "no_copy": 1, "print_hide": 1
      },
      {
        "name": "customer", "label": "Customer", "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "default": "",
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
        "name": "delivery_date", "label": "Delivery Date", "fieldname": "delivery_date", "fieldtype": "Date", "options": "", "default": "",
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
        "name": "territory", "label": "Territory", "fieldname": "territory", "fieldtype": "Link", "options": "Territory", "default": "",
        "mandatory": 0, "read_only": 0, "hidden": 0, "depends_on": "", "description": "", "length": 0, "precision": "",
        "unique": 0, "allow_on_submit": 0, "in_list_view": 0, "in_print_format": 0, "fetch_from": "", "collapsible": 0,
        "allow_copy": 0, "read_only_on_submit": 0, "fetch_if_empty": 0, "print_hide": 1
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
    const filteredFields = salesOrderFields.filter((field: Doctype) =>
      !['name', 'owner', 'creation', 'modified', 'modified_by', 'docstatus', 'idx', 'items'].includes(field.fieldname) &&
      !field.fieldname.startsWith('item_')
    ).sort((a: any, b: any) => (a.idx || 0) - (b.idx || 0));
    
    setFields(filteredFields);
    setFieldsLoading(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.mandatory === 1) {
        const value = formData[field.fieldname];
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.fieldname] = `${field.label} is required`;
        }
      }
    });

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
          warehouse: item.warehouse,
        }))
      };

      const endpoint = mode === 'create' ? 'Sales Order' : `Sales Order/${initialData.name || formData.name}`;
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
        throw new Error(`Failed to ${mode} Sales Order`);
      }

      const responseData = await response.json();

      Alert.alert(
        'Success',
        `Sales Order ${mode === 'create' ? 'created' : 'updated'} successfully!`, 
        [{ text: 'OK', onPress: () => onSuccess?.(responseData.data) }]
      );
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} Sales Order:`, error);
      Alert.alert('Error', `Failed to ${mode} Sales Order. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (fieldname: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldname]: value }));
    
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
    
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith('item_') || key === 'items') {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
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

  if (fieldsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading form...</Text>
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
        {mode === 'create' ? 'Create Sales Order' : 'Edit Sales Order'}
      </Text>

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
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <ItemTable
          items={items}
          onItemsChange={handleItemsChange}
          editable={true}
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
            />
          ))}
        </View>
      )}

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
            />
          ))}
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <StyledButton
          title={loading ? 'Processing...' : (mode === 'create' ? 'Create Sales Order' : 'Update Sales Order')}
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
    backgroundColor: '#007BFF',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
  },
});

export default SalesOrderForm;