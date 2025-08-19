import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface DateFieldProps {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
  mode?: 'date' | 'datetime' | 'time';
}

const DateField: React.FC<DateFieldProps> = ({
  value,
  onChangeValue,
  placeholder = 'Select date',
  editable = true,
  error,
  mode = 'date',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  // Format date for display
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      if (mode === 'time') {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (mode === 'datetime') {
        return date.toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } else {
        return date.toLocaleDateString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    } catch {
      return dateStr;
    }
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get current time in HH:MM format
  const getCurrentTimeString = (): string => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  // Get current datetime in YYYY-MM-DDTHH:MM format
  const getCurrentDateTimeString = (): string => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const openModal = () => {
    if (!editable) return;
    if (Platform.OS === 'web') {
      setInputValue(value || '');
      setShowModal(true);
    } else {
      setShowPicker(true);
    }
  };

  const handleSave = () => {
    onChangeValue(inputValue);
    setShowModal(false);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      let formatted = '';
      if (mode === 'time') {
        formatted = selectedDate.toTimeString().slice(0, 5);
      } else if (mode === 'datetime') {
        formatted = selectedDate.toISOString().slice(0, 16);
      } else {
        formatted = selectedDate.toISOString().split('T')[0];
      }
      onChangeValue(formatted);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setShowModal(false);
  };

  const clearDate = () => {
    onChangeValue('');
  };

  const setToday = () => {
    let todayValue = '';
    if (mode === 'time') {
      todayValue = getCurrentTimeString();
    } else if (mode === 'datetime') {
      todayValue = getCurrentDateTimeString();
    } else {
      todayValue = getTodayString();
    }
    setInputValue(todayValue);
  };

  const getDisplayText = (): string => {
    if (!value) return placeholder;
    return formatDateForDisplay(value) || value;
  };

  const getInputType = (): string => {
    switch (mode) {
      case 'time': return 'time';
      case 'datetime': return 'datetime-local';
      default: return 'date';
    }
  };

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Select {mode === 'datetime' ? 'Date & Time' : mode === 'time' ? 'Time' : 'Date'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <TextInput
              style={styles.dateInput}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Enter ${mode === 'datetime' ? 'date and time' : mode}`}
              {...(Platform.OS === 'web' && {
                type: getInputType()
              })}
            />
            
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionButton} onPress={setToday}>
                <Text style={styles.quickActionText}>
                  {mode === 'time' ? 'Now' : 'Today'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formatHint}>
              <Text style={styles.formatHintText}>
                Format: {mode === 'time' ? 'HH:MM' : mode === 'datetime' ? 'YYYY-MM-DD HH:MM' : 'YYYY-MM-DD'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error ? styles.inputError : {},
          !editable ? styles.inputDisabled : {},
        ]}
        onPress={openModal}
        disabled={!editable}
      >
        <Text style={[
          styles.inputText,
          !value ? styles.placeholderText : {},
        ]}>
          {getDisplayText()}
        </Text>
        {value && editable && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearDate}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
        {editable && (
          <Text style={styles.calendarIcon}>📅</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Web fallback: show modal with TextInput */}
      {Platform.OS === 'web' && renderModal()}

      {/* Native picker for mobile */}
      {showPicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode === 'time' ? 'time' : 'date'}
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  calendarIcon: {
    fontSize: 16,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#999',
  },
  saveButton: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  formatHint: {
    alignItems: 'center',
  },
  formatHintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default DateField;