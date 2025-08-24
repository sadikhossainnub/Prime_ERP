import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '../ThemedText';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const StyledButton: React.FC<StyledButtonProps> = ({ title, onPress, style, textStyle }) => {
  const themedStyles = useThemedStyles();

  return (
    <Pressable
      style={({ pressed }: { pressed: boolean }) => [
        themedStyles.button,
        style,
        pressed && themedStyles.pressed,
      ]}
      onPress={onPress}
    >
      <ThemedText style={[themedStyles.text, textStyle]}>{title}</ThemedText>
    </Pressable>
  );
};

const useThemedStyles = () => {
  const backgroundColor = useThemeColor(
    { light: '#0e0505ff', dark: '#FFFFFF' },
    'tint'
  );
  const textColor = useThemeColor(
    { light: '#FFFFFF', dark: '#000000' },
    'text'
  );
  const shadowColor = useThemeColor(
    { light: '#000', dark: '#fff' },
    'text'
  );

  return StyleSheet.create({
    button: {
      backgroundColor: backgroundColor,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    text: {
      color: textColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    pressed: {
      opacity: 0.8,
    },
  });
};

export default StyledButton;
