import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_KEY, API_SECRET, BASE_URL } from '../../constants/config';
import { getDoctypeFields } from '../../services/fieldpropaty';
import { createItem } from '../../services/item';
import { Doctype } from '../../types/doctypes';
import StyledButton from '../ui/StyledButton';
import DynamicField from './DynamicField';

interface DynamicFormProps {
  doctype: string;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit' | 'view';
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  title?: string;
}

interface FormSection {
  title: string;
  fields: Doctype[];
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  doctype,
  initialData = {},
  mode = 'create',
  onSuccess,
  onCancel,
  title
}) => {
  const [fields, setFields] = useState<Doctype[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isViewMode = mode === 'view';

  useEffect(() => {
    fetchFields();
  }, [doctype]);

  const fetchFields = async () => {
    try {
      setFieldsLoading(true);
      console.log(`Fetching fields for doctype: ${doctype}`);

      const response = await getDoctypeFields(doctype);
      
      // Filter out system fields and sort by idx if available
      let filteredFields = response.sort((a: any, b: any) => (a.idx || 0) - (b.idx || 0));

      if (doctype === 'Item') {
        const itemTypeFieldIndex = filteredFields.findIndex(field => field.fieldname === 'item_type');
        const itemGroupFieldIndex = filteredFields.findIndex(field => field.fieldname === 'item_group');

        if (itemTypeFieldIndex !== -1 && itemGroupFieldIndex !== -1) {
          const itemTypeField = filteredFields.splice(itemTypeFieldIndex, 1)[0];
          const newIndex = filteredFields.findIndex(field => field.fieldname === 'item_group');
          filteredFields.splice(newIndex + 1, 0, itemTypeField);
        }
      }
      
      setFields(filteredFields);
      console.log(`Successfully loaded ${filteredFields.length} fields for ${doctype}`);
    } catch (error: any) {
      console.error('Failed to fetch doctype fields:', error);
      
      let errorMessage = 'Failed to load form fields';
      if (error?.message) {
        if (error.message.includes('permission') || error.message.includes('Access denied')) {
          errorMessage = `Unable to load form fields for ${doctype}. Using basic form fields instead.`;
          
          // Try to use basic fields as fallback
          const basicFields: Doctype[] = [
            {
              name: 'name',
              fieldname: 'name',
              label: 'Name',
              fieldtype: 'Data',
              mandatory: 1,
              options: '',
              default: '',
              read_only: 0,
              hidden: 0,
              depends_on: '',
              description: '',
              length: 0,
              precision: '',
              unique: 0,
              allow_on_submit: 0,
              in_list_view: 1,
              in_print_format: 1,
              fetch_from: '',
              collapsible: 0,
              allow_copy: 1,
              read_only_on_submit: 0,
              fetch_if_empty: 0,
            }
          ];
          
          setFields(basicFields);
          console.warn(`Using basic fields for ${doctype} due to permission restrictions`);
          return; // Don't show error alert, just proceed with basic fields
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      Alert.alert('Error', errorMessage, [
        {
          text: 'OK',
          onPress: () => {
            // Set basic fields as fallback
            const fallbackFields: Doctype[] = [
              {
                name: 'title',
                fieldname: 'title',
                label: 'Title',
                fieldtype: 'Data',
                mandatory: 1,
                options: '',
                default: '',
                read_only: 0,
                hidden: 0,
                depends_on: '',
                description: '',
                length: 0,
                precision: '',
                unique: 0,
                allow_on_submit: 0,
                in_list_view: 1,
                in_print_format: 1,
                fetch_from: '',
                collapsible: 0,
                allow_copy: 1,
                read_only_on_submit: 0,
                fetch_if_empty: 0,
              }
            ];
            setFields(fallbackFields);
          }
        }
      ]);
    } finally {
      setFieldsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchFields().then(() => setRefreshing(false));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.mandatory === 1) {
        const value = formData[field.fieldname];
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.fieldname] = `${field.label} is required`;
        }
      }

      // Email validation
      if (field.fieldtype === 'Data' && field.fieldname.toLowerCase().includes('email')) {
        const value = formData[field.fieldname];
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          newErrors[field.fieldname] = 'Please enter a valid email address';
        }
      }

      // Numeric validation
      if (['Int', 'Float', 'Currency', 'Percent'].includes(field.fieldtype)) {
        const value = formData[field.fieldname];
        if (value !== undefined && value !== null && isNaN(Number(value))) {
          newErrors[field.fieldname] = 'Please enter a valid number';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData({});
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      let responseData;
      if (doctype === 'Item' && mode === 'create') {
        responseData = await createItem(formData);
      } else {
        const endpoint = mode === 'create' ? doctype : `${doctype}/${initialData.name || formData.name}`;
        const method = mode === 'create' ? 'POST' : 'PUT';
        
        const response = await fetch(`${BASE_URL}/api/resource/${endpoint}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${API_KEY}:${API_SECRET}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${mode} ${doctype}`);
        }
        responseData = await response.json();
      }

      Alert.alert(
        'Success',
        `${doctype} ${mode === 'create' ? 'created' : 'updated'} successfully!`,
        [{ text: 'OK', onPress: () => {
          if (doctype === 'Item' && mode === 'create') {
            clearForm();
          }
          onSuccess?.(responseData.data);
        }}]
      );
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} ${doctype}:`, error);
      Alert.alert('Error', `Failed to ${mode} ${doctype}. Please try again.`);
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

  const groupFieldsIntoSections = (fields: Doctype[]): FormSection[] => {
    const sections: FormSection[] = [];
    let currentSection: FormSection | null = null;
    
    fields.forEach(field => {
      // Create sections based on field patterns or you can enhance this logic
      // By default, no section title is assigned
      let sectionTitle = '';

      if (field.fieldname.includes('email') || field.fieldname.includes('phone') ||
                 field.fieldname.includes('mobile') || field.fieldname.includes('contact')) {
        sectionTitle = 'Contact Information';
      } else if (field.fieldname.includes('rate') || field.fieldname.includes('price') ||
                 field.fieldname.includes('amount') || field.fieldname.includes('tax') ||
                 field.fieldname.includes('currency')) {
        sectionTitle = 'Pricing Information';
      } else if (field.fieldname.includes('stock') || field.fieldname.includes('qty') ||
                 field.fieldname.includes('inventory') || field.fieldname.includes('warehouse')) {
        sectionTitle = 'Inventory Information';
      } else {
        // Only group fields under a "General Information" title if no other section applies
        sectionTitle = 'General Information';
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

  if (fields.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No fields found for {doctype}</Text>
      </View>
    );
  }

  const sections = groupFieldsIntoSections(fields);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>
        {title || `${mode === 'create' ? 'Create' : 'Edit'} ${doctype}`}
      </Text>

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          {section.title ? <Text style={styles.sectionTitle}>{section.title}</Text> : null}
          
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

      {!isViewMode && (
        <View style={styles.buttonContainer}>
          <StyledButton
            title={loading ? 'Processing...' : (mode === 'create' ? `Create ${doctype}` : `Update ${doctype}`)}
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
      )}
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

export default DynamicForm;
