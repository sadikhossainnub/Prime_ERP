import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface StyledInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
}

const StyledInput: React.FC<StyledInputProps> = ({ containerStyle, style, ...props }: StyledInputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#A9A9A9"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  input: {
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    padding: 18,
    fontSize: 16,
    color: '#333',
  },
});

export default StyledInput;
