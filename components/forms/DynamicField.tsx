import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Doctype } from '../../types/doctypes';
import StyledInput from '../ui/StyledInput';

interface DynamicFieldProps {
  field: Doctype;
  value: any;
  onChangeValue: (fieldname: string, value: any) => void;
  error?: string;
}

const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChangeValue,
  error
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
      case 'Link':
      case 'Dynamic Link':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            editable={!isReadOnly}
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
      case 'Datetime':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            editable={!isReadOnly}
          />
        );

      case 'Time':
        return (
          <StyledInput
            placeholder={placeholder}
            value={value || ''}
            onChangeText={handleChange}
            editable={!isReadOnly}
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
        // For now, render as text input. Could be enhanced with picker
        return (
          <StyledInput
            placeholder={`${placeholder}${field.options ? ` (Options: ${field.options})` : ''}`}
            value={value || ''}
            onChangeText={handleChange}
            editable={!isReadOnly}
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

  // Skip hidden fields
  if (field.hidden === 1) {
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