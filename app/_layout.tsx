import { ThemedText } from '@/components/ThemedText';
import { checkForUpdate } from '@/services/update';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    checkForUpdate();
  }, []);

  console.log('RootLayoutNav - isLoading:', isLoading, 'user:', user);

  if (isLoading) {
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

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user && user.authenticated ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}