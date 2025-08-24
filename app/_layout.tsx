import { checkForUpdate } from '@/services/update';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { startLocationTracking, stopLocationTracking } from '../services/locationTracking';
import { checkAntiSpoof } from '../src/native/antiSpoofing';
import BlockedScreen from '../src/screens/BlockedScreen';
import { AuthProvider, useAuth } from './AuthContext';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const rootNavigationState = useRootNavigationState();
  const router = useRouter();

  const runChecks = useCallback(async () => {
    setAppLoading(true);
    const { vpn, mockLocation, rooted } = await checkAntiSpoof();

    if (rooted) {
      setBlockedReason('Device is rooted. This app cannot run on rooted devices.');
    } else if (vpn && mockLocation) {
      setBlockedReason('VPN and fake GPS detected.');
    } else if (vpn) {
      setBlockedReason('VPN detected.');
    } else if (mockLocation) {
      setBlockedReason('Fake/Simulated GPS detected.');
    } else {
      setBlockedReason(null);
    }

    setAppLoading(false);
  }, []);

  useEffect(() => {
    checkForUpdate();
    runChecks();
  }, [runChecks]);

  // Handle location tracking based on user state
  useEffect(() => {
    if (!isLoading && !blockedReason) {
      if (user) {
        console.log('User logged in, starting location tracking.');
        startLocationTracking();
      } else {
        console.log('User logged out, stopping location tracking.');
        stopLocationTracking();
      }
    }
  }, [user, isLoading, blockedReason]);

  console.log('RootLayoutNav - isLoading:', isLoading, 'user:', user);
  console.log('RootLayoutNav - rootNavigationState:', rootNavigationState);

  if (appLoading || isLoading) { // Combine appLoading and AuthContext isLoading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (blockedReason) {
    return <BlockedScreen reason={blockedReason} onRetry={runChecks} />;
  }

  // Conditionally render the appropriate Stack navigator
  if (user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Authenticated routes */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    );
  } else {
    return (
      <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
        {/* Unauthenticated routes */}
        <Stack.Screen name="login" />
        <Stack.Screen name="forgetpassword" />
      </Stack>
    );
  }
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
