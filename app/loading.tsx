import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <ActivityIndicator size="large" color="#4f46e5" />
      <ThemedText style={{ marginTop: 12, fontSize: 16 }}>Loading...</ThemedText>
    </View>
  );
}