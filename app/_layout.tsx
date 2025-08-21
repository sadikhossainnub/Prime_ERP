import { checkForUpdate } from '@/services/update';
import { Stack } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import { startLocationTracking, stopLocationTracking } from '../services/locationTracking';
import { AuthProvider, useAuth } from './AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    checkForUpdate();

    const setupLocationTracking = async () => {
      if (!isLoading) { // Ensure authentication state is loaded
        if (user) {
          console.log('User logged in, starting location tracking.');
          await startLocationTracking();
        } else {
          console.log('User logged out, stopping location tracking.');
          await stopLocationTracking();
        }
      }
    };

    setupLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [user, isLoading]);

  console.log('RootLayoutNav - isLoading:', isLoading, 'user:', user);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="sellingmodulemenu" options={{ headerShown: false }} />
        </>
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
