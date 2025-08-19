import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_KEY, API_SECRET, BASE_URL } from '../../constants/config';
import { getDoctypeFields } from '../../services/fieldpropaty';
import { Doctype } from '../../types/doctypes';
import StyledButton from '../ui/StyledButton';
import DynamicField from './DynamicField';

interface DynamicFormProps {
  doctype: string;
  initialData?: Record<string, any>;
  mode?: 'create' | 'edit';
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

  useEffect(() => {
    fetchFields();
  }, [doctype]);

  const fetchFields = async () => {
    try {
      setFieldsLoading(true);
      const doctypeList = await getDoctypes();
      console.log('Doctypes:', doctypeList);

      const response = await getDoctypeFields(doctype);
      
      // Filter out system fields and sort by idx if available
      const filteredFields = response.filter((field: Doctype) =>
        !['name', 'owner', 'creation', 'modified', 'modified_by', 'docstatus', 'idx'].includes(field.fieldname)
      ).sort((a: any, b: any) => (a.idx || 0) - (b.idx || 0));
      
      setFields(filteredFields);
    } catch (error) {
      console.error('Failed to fetch doctype fields:', error);
      Alert.alert('Error', 'Failed to load form fields');
    } finally {
      setFieldsLoading(false);
    }
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
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

      const responseData = await response.json();

      Alert.alert(
        'Success',
        `${doctype} ${mode === 'create' ? 'created' : 'updated'} successfully!`,
        [{ text: 'OK', onPress: () => onSuccess?.(responseData.data) }]
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
      let sectionTitle = 'General Information';
      
      if (field.fieldname.includes('address') || field.fieldname.includes('city') || 
          field.fieldname.includes('state') || field.fieldname.includes('country') || 
          field.fieldname.includes('pincode')) {
        sectionTitle = 'Address Information';
      } else if (field.fieldname.includes('email') || field.fieldname.includes('phone') || 
                 field.fieldname.includes('mobile') || field.fieldname.includes('contact')) {
        sectionTitle = 'Contact Information';
      } else if (field.fieldname.includes('rate') || field.fieldname.includes('price') || 
                 field.fieldname.includes('amount') || field.fieldname.includes('tax') ||
                 field.fieldname.includes('currency')) {
        sectionTitle = 'Pricing Information';
      } else if (field.fieldname.includes('stock') || field.fieldname.includes('qty') || 
                 field.fieldname.includes('inventory') || field.fieldname.includes('warehouse')) {
        sectionTitle = 'Inventory Information';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>
        {title || `${mode === 'create' ? 'Create' : 'Edit'} ${doctype}`}
      </Text>

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          {section.fields.map((field) => (
            <DynamicField
              key={field.fieldname}
              field={field}
              value={formData[field.fieldname]}
              onChangeValue={updateField}
              error={errors[field.fieldname]}
            />
          ))}
        </View>
      ))}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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