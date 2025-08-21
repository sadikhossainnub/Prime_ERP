import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { apiRequest } from '../../services/api';
import { getDoctypes } from '../../services/doctype';
import { debounce } from '../../utils/debounce';

interface LinkFieldProps {
  doctype: string;
  fieldname: string; // Add fieldname prop
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
  filters?: (string[] | (string[] | 'or')[])[]; // Allow for nested filter conditions for OR
}

interface LinkOption {
  name: string;
  title?: string;
  [key: string]: any;
}

const LinkField: React.FC<LinkFieldProps> = ({
  doctype,
  fieldname, // Destructure fieldname
  value,
  onChangeValue,
  placeholder = 'Select an option',
  editable = true,
  error,
  filters: propFilters,
}) => {
  const [options, setOptions] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<LinkOption | null>(null);
  const [buttonText, setButtonText] = useState(placeholder);

  const fetchOptions = useCallback(async (query: string = '') => {
    if (!doctype) return;

    setLoading(true);
    try {
      let fetchedOptions: LinkOption[] = [];

      if (doctype === 'DocType') {
        // Use the specialized service for fetching doctypes
        const doctypeNames = await getDoctypes();
        fetchedOptions = doctypeNames.map(name => ({ name }));
      } else {
        // Use the generic resource fetcher for other doctypes
        // Dynamically determine fields to fetch. Always include 'name' and 'title'.
        // Add other common display fields if they are relevant for the doctype.
        const dynamicFieldsToFetch = ['name'];
        if (doctype === 'Customer') {
          dynamicFieldsToFetch.push('customer_name');
        } else if (doctype === 'Item') {
          dynamicFieldsToFetch.push('item_name');
        }
        // Add 'title' for doctypes other than 'UOM'
        if (doctype !== 'UOM') {
          dynamicFieldsToFetch.push('title');
        }

        // Ensure unique fields
        const fieldsToFetch = Array.from(new Set(dynamicFieldsToFetch));

        const params: any = {
          fields: JSON.stringify(fieldsToFetch),
          order_by: 'modified desc',
          limit_page_length: 999999, // Remove API limit
        };

        let allFilters: (string[] | (string[] | 'or')[])[] = propFilters ? [...propFilters] : [];

        if (query.trim()) {
          const searchQuery = `%${query.trim()}%`;
          const searchConditions: string[][] = [
            ['name', 'like', searchQuery]
          ];
          if (doctype !== 'UOM' && dynamicFieldsToFetch.includes('title')) { // Only add title search if not UOM
            searchConditions.push(['title', 'like', searchQuery]);
          }
          if (dynamicFieldsToFetch.includes('customer_name')) {
            searchConditions.push(['customer_name', 'like', searchQuery]);
          }
          if (dynamicFieldsToFetch.includes('item_name')) {
            searchConditions.push(['item_name', 'like', searchQuery]);
          }
          
          if (searchConditions.length > 0) {
            if (searchConditions.length === 1) {
              // If only one search condition, add it directly to allFilters
              allFilters.push(searchConditions[0]);
            } else {
              // If multiple search conditions, combine them with "or"
              const combinedOrConditions: (string[] | 'or')[] = [];
              for (let i = 0; i < searchConditions.length; i++) {
                combinedOrConditions.push(searchConditions[i]);
                if (i < searchConditions.length - 1) {
                  combinedOrConditions.push('or');
                }
              }
              allFilters.push(combinedOrConditions); // This adds the OR group as one element
            }
          }
        }
        
        if (allFilters.length > 0) {
          params.filters = JSON.stringify(allFilters);
        }

        const data = await apiRequest(doctype, {
          method: 'GET',
          params: params,
        });
        console.log('LinkField fetchOptions response data:', data);
        fetchedOptions = data.data || [];
      }

      setOptions(fetchedOptions);

    } catch (error) {
      console.error(`Error fetching ${doctype} options:`, error);
      Alert.alert('Error', `Failed to fetch ${doctype} options. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [doctype, propFilters]);

  // Fetch selected option details when value changes
  useEffect(() => {
    if (value && doctype) {
      fetchSelectedOption();
    } else {
      setSelectedOption(null);
    }
  }, [value, doctype]);

  useEffect(() => {
    setButtonText(getDisplayText());
  }, [selectedOption, value, placeholder]);

  const fetchSelectedOption = async () => {
    if (!value || !doctype) return;

    try {
      const data = await apiRequest(`${doctype}/${value}`, {
        method: 'GET',
      });
      setSelectedOption(data.data);
    } catch (error) {
      console.error(`Error fetching ${doctype} details:`, error);
    }
  };

  const selectOption = (option: LinkOption) => {
    onChangeValue(option.name);
    setSelectedOption(option);
  };

  const getDisplayText = () => {
    if (!value) return placeholder;
    
    if (selectedOption) {
      return selectedOption.title || 
             selectedOption.customer_name || 
             selectedOption.supplier_name || 
             selectedOption.item_name || 
             selectedOption.name;
    }
    
    return value;
  };

  return (
    <View style={styles.container}>
      <SelectDropdown
        data={options}
        onSelect={(selectedItem: LinkOption) => {
          selectOption(selectedItem);
        }}
        renderButton={(selectedItem, isOpened) => (
          <View style={[
            styles.inputContainer,
            error ? styles.inputError : {},
            !editable ? styles.inputDisabled : {},
          ]}>
            <Text style={styles.inputText}>
              {(selectedItem && (selectedItem.title || selectedItem.customer_name || selectedItem.supplier_name || selectedItem.item_name || selectedItem.name)) || buttonText}
            </Text>
            <Ionicons name={isOpened ? "chevron-up" : "chevron-down"} style={styles.dropdownIcon} />
          </View>
        )}
        renderItem={(item, index, isSelected) => (
          <View style={[styles.rowStyle, isSelected && styles.rowSelected]}>
            <Text style={[styles.rowTextStyle, isSelected && styles.rowTextSelected]}>
              {item.title ? `${item.name} - ${item.title}` : item.name}
            </Text>
          </View>
        )}
        dropdownStyle={styles.dropdownStyle}
        disabled={!editable}
        search
        searchInputStyle={styles.searchInput}
        searchInputTxtColor={'#151E26'}
        searchPlaceHolder={'Search here'}
        searchPlaceHolderColor={'#999'}
        renderSearchInputLeftIcon={() => <Ionicons name="search" style={styles.searchIcon} />}
        onFocus={() => fetchOptions('')}
        onChangeSearchInputText={debounce((text: string) => fetchOptions(text), 500)}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface Styles {
  container: ViewStyle;
  inputContainer: ViewStyle;
  inputError: ViewStyle;
  inputDisabled: ViewStyle;
  inputText: TextStyle;
  dropdownIcon: TextStyle;
  dropdownStyle: ViewStyle;
  rowStyle: ViewStyle;
  rowSelected: ViewStyle;
  rowTextStyle: TextStyle;
  rowTextSelected: TextStyle;
  errorText: TextStyle;
  searchInput: ViewStyle;
  searchIcon: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    width: '100%',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  dropdownIcon: {
    fontSize: 20,
    color: '#757575',
    marginLeft: 8,
  },
  dropdownStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rowStyle: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowSelected: {
    backgroundColor: '#E3F2FD',
  },
  rowTextStyle: {
    color: '#424242',
    textAlign: 'left',
    fontSize: 16,
  },
  rowTextSelected: {
    color: '#1565C0',
    fontWeight: '500',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#757575',
    marginRight: 8,
  },
});

export default LinkField;
