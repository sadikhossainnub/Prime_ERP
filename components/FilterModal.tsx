import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerGroup, setCustomerGroup] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleApply = () => {
    onApply({ customerName, customerGroup, date, status });
    onClose();
  };

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
    cardBackground: cardBackgroundColor,
    tint: tintColor,
    icon: iconColor,
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Filter Options</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            placeholderTextColor={iconColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Customer Group"
            value={customerGroup}
            onChangeText={setCustomerGroup}
            placeholderTextColor={iconColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholderTextColor={iconColor}
          />
          <TextInput
            style={styles.input}
            placeholder="Status"
            value={status}
            onChangeText={setStatus}
            placeholderTextColor={iconColor}
          />
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: {
  background: string;
  text: string;
  cardBackground: string;
  tint: string;
  icon: string;
}) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
      margin: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
      color: theme.text,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    input: {
      height: 40,
      borderColor: theme.icon,
      borderWidth: 1,
      marginBottom: 16,
      paddingHorizontal: 8,
      borderRadius: 8,
      width: 200,
      color: theme.text,
    },
    applyButton: {
      backgroundColor: theme.tint,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    applyButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default FilterModal;
