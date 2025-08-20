import { checkForUpdate } from '@/services/update';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { startLocationTracking, stopLocationTracking } from '../services/locationTracking';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingScreen from './loading';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    checkForUpdate();
    if (user) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [user]);

  console.log('RootLayoutNav - isLoading:', isLoading, 'user:', user);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
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
