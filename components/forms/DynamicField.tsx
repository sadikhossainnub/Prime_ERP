import React from 'react';
import { Button, StyleSheet, Switch, Text, View } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { Doctype } from '../../types/doctypes';
import { ThemedText } from '../ThemedText';
import StyledInput from '../ui/StyledInput';
import DateField from './DateField';
import DynamicLinkField from './DynamicLinkField';
import ItemTable from './ItemTable';
import LinkField from './LinkField';

interface DynamicFieldProps {
  field: Doctype;
  value: any;
  onChangeValue: (fieldname: string, value: any) => void;
  error?: string;
  formData?: Record<string, any>;
}

const evaluateDependsOn = (condition: string | undefined, doc: any): boolean => {
  if (!condition) {
    return true;
  }

  if (condition.startsWith('eval:')) {
    const expression = condition.substring(5);
    try {
      const func = new Function('doc', `return ${expression}`);
      return !!func(doc);
    } catch (e) {
      console.error(`Error evaluating depends_on expression: "${expression}"`, e);
      return false;
    }
  }

  return !!doc[condition];
};

const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChangeValue,
  error,
  formData = {}
}) => {
  const isRequired = field.mandatory === 1;
  const isReadOnly = field.read_only === 1;
  const placeholder = `${field.label}${isRequired ? ' *' : ''}`;

  const handleChange = (newValue: any) => {
    onChangeValue(field.fieldname, newValue);
  };

  const renderField = () => {
    switch (field.fieldtype) {
      case 'Data':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            editable={!isReadOnly}
          />
        );
      
      case 'Link':
        let filters: [string, string, string][] | undefined;
        if (field.fieldname === 'customer_address' && formData.party_name) {
          filters = [['customer', '=', formData.party_name]];
        }
        if (field.fieldname === 'contact_person' && formData.party_name) {
          filters = [['customer', '=', formData.party_name]];
        }

        return (
          <LinkField
            doctype={field.options || ''}
            fieldname={field.fieldname} // Pass the fieldname
            value={value || ''}
            onChangeValue={handleChange}
            placeholder={placeholder}
            editable={!isReadOnly}
            error={error}
            filters={filters}
          />
        );

      case 'Dynamic Link':
        // For Dynamic Link, we need to find the corresponding doctype field
        // Typically it's the field with the same prefix but ending with '_type'
        const dynamicTypeField = field.options || `${field.fieldname.replace(/_link$|_reference$/, '')}_type`;
        const dynamicTypeValue = formData[dynamicTypeField];
        
        return (
          <DynamicLinkField
            value={value || ''}
            onChangeValue={handleChange}
            dynamicTypeField={dynamicTypeField}
            dynamicTypeValue={dynamicTypeValue}
            onChangeDynamicType={(doctype) => onChangeValue(dynamicTypeField, doctype)}
            placeholder={placeholder}
            editable={!isReadOnly}
            error={error}
            formData={formData}
          />
        );

      case 'Long Text':
      case 'Text Editor':
      case 'Code':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            multiline
            numberOfLines={4}
            editable={!isReadOnly}
          />
        );

      case 'Int':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value?.toString() || ''}
            onChangeText={(text) => handleChange(parseInt(text) || 0)}
            keyboardType="numeric"
            editable={!isReadOnly}
          />
        );

      case 'Float':
      case 'Currency':
      case 'Percent':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value?.toString() || ''}
            onChangeText={(text) => handleChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            editable={!isReadOnly}
          />
        );

      case 'Date':
        return (
          <DateField
            value={value || ''}
            onChangeValue={handleChange}
            placeholder={placeholder}
            editable={!isReadOnly}
            error={error}
            mode="date"
          />
        );

      case 'Datetime':
        return (
          <DateField
            value={value || ''}
            onChangeValue={handleChange}
            placeholder={placeholder}
            editable={!isReadOnly}
            error={error}
            mode="datetime"
          />
        );

      case 'Time':
        return (
          <DateField
            value={value || ''}
            onChangeValue={handleChange}
            placeholder={placeholder}
            editable={!isReadOnly}
            error={error}
            mode="time"
          />
        );

      case 'Check':
        return (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{field.label}</Text>
            <Switch
              value={value === 1 || value === true}
              onValueChange={(val) => handleChange(val ? 1 : 0)}
              disabled={isReadOnly}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={value ? '#007BFF' : '#f4f3f4'}
            />
          </View>
        );

      case 'Select':
        const options = field.options ? field.options.split('\n') : [];
        return (
          <SelectDropdown
            data={options}
            onSelect={(selectedItem) => {
              handleChange(selectedItem);
            }}
            renderButton={(selectedItem, isOpened) => (
              <View style={[
                styles.inputContainer,
                error ? styles.inputError : {},
                !isReadOnly ? {} : styles.inputDisabled,
              ]}>
                <Text style={styles.inputText}>
                  {selectedItem || value || placeholder}
                </Text>
                <Text style={styles.dropdownIcon}>{isOpened ? '▲' : '▼'}</Text>
              </View>
            )}
            renderItem={(item, index, isSelected) => (
              <View style={{ ...styles.rowStyle, ...(isSelected && { backgroundColor: '#c5c5c5' }) }}>
                <Text style={styles.rowTextStyle}>{item}</Text>
              </View>
            )}
            dropdownStyle={styles.dropdownStyle}
            disabled={isReadOnly}
          />
        );

      case 'Password':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            secureTextEntry
            editable={!isReadOnly}
          />
        );

      case 'Read Only':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={() => {}} // No-op
            editable={false}
          />
        );

      case 'Button':
        // Skip rendering buttons in forms
        return null;

      case 'Section Break':
        return <ThemedText type="subtitle">{field.label}</ThemedText>;

      case 'Column Break':
      case 'Tab Break':
        return null;

      case 'Table':
        return (
          <ItemTable
            items={value || []}
            onItemsChange={handleChange}
            editable={!isReadOnly}
          />
        );

      case 'Rating':
        // Placeholder for Rating component
        return (
          <StyledInput
            placeholder={placeholder}
            value={value?.toString() || ''}
            onChangeText={(text) => handleChange(parseInt(text) || 0)}
            keyboardType="numeric"
            editable={!isReadOnly}
          />
        );

      case 'Attach Image':
        // Placeholder for Attach Image component
        return (
          <View>
            <Text>{field.label}</Text>
            <Button title="Upload Image" onPress={() => {}} disabled={isReadOnly} />
            {value && <Text>Image Attached: {value}</Text>}
          </View>
        );
      
      case 'HTML':
        // Placeholder for HTML component
        return (
          <View>
            <Text>{field.label}</Text>
            <Text>(HTML content not rendered)</Text>
          </View>
        );

      default:
        // Default to text input for unknown field types
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            editable={!isReadOnly}
          />
        );
    }
  };

  const isVisible = evaluateDependsOn(field.depends_on, formData);

  // Skip hidden or dependent fields that should not be visible
  if (field.hidden === 1 || !isVisible) {
    return null;
  }

  return (
    <View style={styles.fieldContainer}>
      {renderField()}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {field.description && (
        <Text style={styles.descriptionText}>{field.description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  descriptionText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default DynamicField;
