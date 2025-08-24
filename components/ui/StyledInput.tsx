import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface StyledInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
}

const StyledInput: React.FC<StyledInputProps> = ({ containerStyle, style, ...props }: StyledInputProps) => {
  const backgroundColor = useThemeColor({ light: '#F6F6F6', dark: 'black' }, 'background');
  const color = useThemeColor({ light: '#333', dark: 'white' }, 'text');
  const borderColor = useThemeColor({ light: '#E8E8E8', dark: '#E8E8E8' }, 'text');
  const shadowColor = useThemeColor({ light: 'transparent', dark: 'white' }, 'text');

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor,
            color,
            borderColor,
            shadowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 5,
            elevation: 5,
          },
          style,
        ]}
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
    borderWidth: 1,
    borderRadius: 10,
    padding: 18,
    fontSize: 16,
  },
});

export default StyledInput;
