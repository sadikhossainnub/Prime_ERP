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
import { apiMethodRequest, apiRequest } from '../../services/api';
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
  label?: string; // Add label for display
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

      // Use the generic resource fetcher for all doctypes
      // Dynamically determine fields to fetch. Always include 'name'.
      const dynamicFieldsToFetch = ['name'];
      let displayField = 'name'; // Field to use for display label

      if (doctype === 'Customer') {
        dynamicFieldsToFetch.push('customer_name');
        displayField = 'customer_name';
      } else if (doctype === 'Item') {
        dynamicFieldsToFetch.push('item_name');
        displayField = 'item_name';
      } else if (doctype !== 'UOM') {
        // For other doctypes (not Customer, Item, or UOM), try to get the title field
        try {
          const titleRes = await apiMethodRequest(`frappe.desk.search.get_title_field`, {
            params: { doctype },
          });
          if (titleRes.message) {
            dynamicFieldsToFetch.push(titleRes.message);
            displayField = titleRes.message;
          }
        } catch (titleError) {
          console.warn(`Could not fetch title field for doctype ${doctype}:`, titleError);
          // Fallback to 'name' if title field cannot be fetched
        }
      }

      // Ensure unique fields
      const fieldsToFetch = Array.from(new Set(dynamicFieldsToFetch));

      const params: any = {
        fields: JSON.stringify(fieldsToFetch),
        order_by: 'modified desc',
        limit_page_length: 999999, // Remove API limit
      };

      const allFilters: { fieldname: string; operator: string; value: any }[] = [];

      // Convert propFilters to the new object format.
      if (propFilters) {
        propFilters.forEach(filter => {
          if (
            Array.isArray(filter) &&
            filter.length === 3 &&
            typeof filter[0] === 'string' &&
            typeof filter[1] === 'string'
          ) {
            allFilters.push({
              fieldname: filter[0],
              operator: filter[1],
              value: filter[2],
            });
          } else {
            console.warn('LinkField: Ignoring complex filter format:', filter);
          }
        });
      }

      // Add the search term as a 'like' filter, which is the safe way for search bars.
      if (query.trim()) {
        allFilters.push({
          fieldname: displayField,
          operator: 'like',
          value: `%${query.trim()}%`,
        });
      }

      // If we have any filters, convert them to the list format and stringify for the request.
      if (allFilters.length > 0) {
        const filtersAsList = allFilters.map(f => [f.fieldname, f.operator, f.value]);
        params.filters = JSON.stringify(filtersAsList);
      }

      const data = await apiRequest(`resource/${encodeURIComponent(doctype)}`, {
        method: 'GET',
        params: params,
      });
      console.log('LinkField fetchOptions response data:', data);
      fetchedOptions = data.data || [];
      // Assign the correct label for display
      fetchedOptions = fetchedOptions.map(option => ({
        ...option,
        label: option[displayField] || option.name
      }));

      setOptions(fetchedOptions);

    } catch (error) {
      console.error(`Error fetching ${doctype} options:`, error);
      Alert.alert('Error', `Failed to fetch ${doctype} options. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [doctype, propFilters]);

  const debouncedFetchOptions = useCallback(
    debounce((query: string) => fetchOptions(query), 500),
    [fetchOptions]
  );

  useEffect(() => {
    // Cleanup function to cancel any pending fetches
    return () => {
      debouncedFetchOptions.cancel();
    };
  }, [debouncedFetchOptions]);

  // Fetch selected option details when value changes
  useEffect(() => {
    if (value && doctype) {
      fetchSelectedOption();
    } else {
      setSelectedOption(null);
      setButtonText(placeholder);
    }
  }, [value, doctype]);

  useEffect(() => {
    const newButtonText = getDisplayText();
    if (newButtonText !== buttonText) {
      setButtonText(newButtonText);
    }
  }, [selectedOption, value, placeholder, buttonText]);

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
      const { label, name } = selectedOption;
      if (label && label !== name) {
        return `${label} (${name})`;
      }
      return name;
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
              {(selectedItem &&
                (selectedItem.label && selectedItem.label !== selectedItem.name
                  ? `${selectedItem.label} (${selectedItem.name})`
                  : selectedItem.name)) ||
                buttonText}
            </Text>
            <Ionicons name={isOpened ? "chevron-up" : "chevron-down"} style={styles.dropdownIcon} />
          </View>
        )}
        renderItem={(item, index, isSelected) => (
          <View style={[styles.rowStyle, isSelected && styles.rowSelected]}>
            <Text style={[styles.rowTextStyle, isSelected && styles.rowTextSelected]}>
              {item.label && item.label !== item.name ? `${item.label} (${item.name})` : item.name}
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
        onFocus={() => debouncedFetchOptions('')}
        onChangeSearchInputText={debouncedFetchOptions}
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
