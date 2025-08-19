import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getDoctypes, getModuleDoctypes } from '../../services/doctype';
import LinkField from './LinkField';

interface DynamicLinkFieldProps {
  value: string;
  onChangeValue: (value: string) => void;
  dynamicTypeField?: string;
  dynamicTypeValue?: string;
  onChangeDynamicType?: (doctype: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
  formData?: Record<string, any>;
}

interface DoctypeOption {
  name: string;
  module?: string;
}

const DynamicLinkField: React.FC<DynamicLinkFieldProps> = ({
  value,
  onChangeValue,
  dynamicTypeField,
  dynamicTypeValue,
  onChangeDynamicType,
  placeholder = 'Select document type first',
  editable = true,
  error,
  formData = {},
}) => {
  const [isDoctypeModalVisible, setIsDoctypeModalVisible] = useState(false);
  const [doctypes, setDoctypes] = useState<DoctypeOption[]>([]);
  const [filteredDoctypes, setFilteredDoctypes] = useState<DoctypeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get the current selected doctype from form data or dynamic type value
  const selectedDoctype = dynamicTypeValue || formData?.[dynamicTypeField || ''] || '';

  useEffect(() => {
    fetchDoctypes();
  }, []);

  const fetchDoctypes = async () => {
    try {
      setLoading(true);
      
      // Try to get all doctypes, with fallback to common doctypes
      let fetchedDoctypes: string[] = [];
      
      try {
        fetchedDoctypes = await getDoctypes(2, true);
      } catch (error) {
        console.warn('Failed to fetch all doctypes, using module-specific doctypes');
        // Fallback to common selling module doctypes for quotations
        fetchedDoctypes = [
          ...getModuleDoctypes('core'),
          ...getModuleDoctypes('selling'),
          ...getModuleDoctypes('buying'),
          ...getModuleDoctypes('stock'),
        ];
      }

      // Convert to DoctypeOption format and remove duplicates
      const doctypeOptions: DoctypeOption[] = Array.from(new Set(fetchedDoctypes))
        .map(name => ({ name }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setDoctypes(doctypeOptions);
      setFilteredDoctypes(doctypeOptions);
    } catch (error) {
      console.error('Error fetching doctypes:', error);
      Alert.alert('Error', 'Failed to fetch document types. Please try again.');
      
      // Use hardcoded common doctypes as final fallback
      const fallbackDoctypes = [
        'Customer', 'Supplier', 'Item', 'Contact', 'Address',
        'Lead', 'Opportunity', 'Quotation', 'Sales Order',
        'Purchase Order', 'Employee', 'User', 'Company'
      ].map(name => ({ name }));
      
      setDoctypes(fallbackDoctypes);
      setFilteredDoctypes(fallbackDoctypes);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctypeSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredDoctypes(doctypes);
      return;
    }

    const filtered = doctypes.filter(doctype =>
      doctype.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredDoctypes(filtered);
  };

  const selectDoctype = (doctype: DoctypeOption) => {
    if (onChangeDynamicType) {
      onChangeDynamicType(doctype.name);
    }
    
    // Clear the current value when doctype changes
    onChangeValue('');
    
    setIsDoctypeModalVisible(false);
    setSearchQuery('');
  };

  const openDoctypeModal = () => {
    if (!editable) return;
    setIsDoctypeModalVisible(true);
    setSearchQuery('');
  };

  const renderDoctypeOption = ({ item }: { item: DoctypeOption }) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => selectDoctype(item)}
    >
      <Text style={styles.optionText}>{item.name}</Text>
      {item.module && (
        <Text style={styles.optionSubText}>Module: {item.module}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Document Type Selector */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Document Type</Text>
        <TouchableOpacity
          style={[
            styles.inputContainer,
            !editable ? styles.inputDisabled : {},
          ]}
          onPress={openDoctypeModal}
          disabled={!editable}
        >
          <Text style={[
            styles.inputText,
            !selectedDoctype ? styles.placeholderText : {},
          ]}>
            {selectedDoctype || 'Select Document Type'}
          </Text>
          {editable && (
            <Text style={styles.dropdownIcon}>▼</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Document Selector - Only show if doctype is selected */}
      {selectedDoctype && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Select {selectedDoctype}</Text>
          <LinkField
            doctype={selectedDoctype}
            value={value}
            onChangeValue={onChangeValue}
            placeholder={`Select ${selectedDoctype}`}
            editable={editable}
            error={error}
          />
        </View>
      )}

      {/* Show error if no doctype selected but field has error */}
      {!selectedDoctype && error && (
        <Text style={styles.errorText}>Please select a document type first</Text>
      )}

      {/* Document Type Selection Modal */}
      <Modal
        visible={isDoctypeModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Document Type</Text>
              <TouchableOpacity
                onPress={() => setIsDoctypeModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search document types..."
              value={searchQuery}
              onChangeText={handleDoctypeSearch}
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Loading document types...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredDoctypes}
                keyExtractor={(item) => item.name}
                renderItem={renderDoctypeOption}
                style={styles.optionsList}
                showsVerticalScrollIndicator={true}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No document types found {searchQuery ? `for "${searchQuery}"` : ''}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default DynamicLinkField;