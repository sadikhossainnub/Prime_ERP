import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import StyledButton from '@/components/ui/StyledButton';
import StyledInput from '@/components/ui/StyledInput';
import { BASE_URL } from '@/constants/config';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet } from 'react-native';
import CookieManager from 'react-native-cookies';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  });

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/method/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `usr=${encodeURIComponent(username)}&pwd=${encodeURIComponent(password)}`,
      });

      if (response.ok) {
        const cookie = response.headers.get('Set-Cookie');
        if (cookie) {
          await CookieManager.clearAll();
          await CookieManager.setFromResponse(BASE_URL, cookie);
        }
        Alert.alert('Login Successful', 'Welcome!');
        router.replace('/(tabs)');
      } else {
        const errorData = await response.json();
        Alert.alert('Login Failed', errorData.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleBiometricLogin = async () => {
    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
    if (!savedBiometrics) {
      return Alert.alert(
        'Biometric record not found',
        'Please verify your identity with your password',
      );
    }

    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
      disableDeviceFallback: true,
    });

    if (biometricAuth.success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>Welcome Back!</ThemedText>
      <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>
      <StyledInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <StyledInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <StyledButton title="Login" onPress={handleLogin} />
      {isBiometricSupported && (
        <StyledButton
          title="Biometric Login"
          onPress={handleBiometricLogin}
          style={styles.biometricButton}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  biometricButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
  },
});
