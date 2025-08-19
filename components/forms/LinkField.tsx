import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { BASE_URL } from '../../constants/config';
import { getAuthHeaders } from '../../services/authHeaders';
import { getDoctypes } from '../../services/doctype';

interface LinkFieldProps {
  doctype: string;
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
  filters?: [string, string, string][];
}

interface LinkOption {
  name: string;
  title?: string;
  [key: string]: any;
}

const LinkField: React.FC<LinkFieldProps> = ({
  doctype,
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
        const headers = await getAuthHeaders();
        let url = `${BASE_URL}/api/resource/${doctype}?order_by=modified desc`;

        const allFilters: string[] = [];

        if (propFilters) {
          propFilters.forEach(filter => {
            allFilters.push(`[\"${doctype}\",\"${filter[0]}\",\"${filter[1]}\",\"${filter[2]}\"]`);
          });
        }

        if (query.trim()) {
          const searchFields = ['name', 'title', 'customer_name', 'supplier_name', 'item_name'];
          searchFields.forEach(field => {
            allFilters.push(`[\"${doctype}\",\"${field}\",\"like\",\"%${query}%\"]`);
          });
        }

        if (allFilters.length > 0) {
          url += `&filters=[${allFilters.join(',')}]`;
        }
        
        console.log('LinkField fetchOptions URL:', url);
        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
          console.error('LinkField fetchOptions response not ok:', response.status, response.statusText);
          throw new Error(`Failed to fetch ${doctype} options`);
        }

        const data = await response.json();
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
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/resource/${doctype}/${value}`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOption(data.data);
      }
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
            <Text style={styles.dropdownIcon}>{isOpened ? '▲' : '▼'}</Text>
          </View>
        )}
        renderItem={(item, index, isSelected) => (
          <View style={{ ...styles.rowStyle, ...(isSelected && { backgroundColor: '#c5c5c5' }) }}>
            <Text style={styles.rowTextStyle}>{item.name} - {item.title}</Text>
          </View>
        )}
        dropdownStyle={styles.dropdownStyle}
        disabled={!editable}
        search
        searchInputStyle={styles.searchInput}
        searchInputTxtColor={'#151E26'}
        searchPlaceHolder={'Search here'}
        searchPlaceHolderColor={'#999'}
        renderSearchInputLeftIcon={() => {
          return <ActivityIndicator />;
        }}
        onFocus={() => fetchOptions('')}
        onChangeSearchInputText={(text) => fetchOptions(text)}
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
  placeholderText: TextStyle;
  clearButton: ViewStyle;
  clearButtonText: TextStyle;
  dropdownIcon: TextStyle;
  dropdownStyle: ViewStyle;
  rowStyle: ViewStyle;
  rowTextStyle: TextStyle;
  errorText: TextStyle;
  searchInput: ViewStyle;
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
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 48,
    width: '100%',
  },
  inputError: {
    borderColor: '#FF3B30',
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
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  dropdownStyle: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
  },
  rowStyle: {
    backgroundColor: '#EFEFEF',
    borderBottomColor: '#C5C5C5',
  },
  rowTextStyle: {
    color: '#444',
    textAlign: 'left',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    marginBottom: 12,
  },
});

export default LinkField;
