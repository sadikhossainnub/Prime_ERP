import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (user && user.authenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgetpassword" />
    </Stack>
  );
}
