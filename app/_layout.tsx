import { checkForUpdate } from '@/services/update';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect } from 'react';
import { startLocationTracking, stopLocationTracking } from '../services/locationTracking';
import { AuthProvider, useAuth } from './AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkForUpdate();

    const setupLocationTracking = async () => {
      if (!isLoading) {
        if (user) {
          router.replace('/dashboard' as any);
          console.log('User logged in, starting location tracking.');
          await startLocationTracking();
        } else {
          router.replace('/login');
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

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="forgetpassword" />
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
