import StyledButton from '@/components/ui/StyledButton';
import StyledInput from '@/components/ui/StyledInput';
import { BASE_URL } from '@/constants/config';
import { getSid, setSid } from '@/services/api';
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import { Link, Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // Import SecureStore
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from './AuthContext';

const BIOMETRIC_PREFERENCE_KEY = 'prime_erp_biometric_preference'; // Define the key

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, user, setIsLoading, setUser } = useAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const checkBiometricStatus = async () => {
      const biometricPreference = await SecureStore.getItemAsync(BIOMETRIC_PREFERENCE_KEY);
      setBiometricAvailable(biometricPreference === 'true');
    };
    checkBiometricStatus();
    if (biometricAvailable) {
      biometricLogin();
    }
  }, [biometricAvailable]);

  const biometricLogin = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login with Biometrics',
    });

    if (result.success) {
      const sid = await getSid();

      if (sid) {
        try {
          setIsLoading(true);
          const res = await axios.get(`${BASE_URL}/api/method/frappe.auth.get_logged_user`, {
            headers: {
              Cookie: `sid=${sid}`,
            },
          });
          setUser(res.data.message);
        } catch (error) {
          Alert.alert('Biometric Login Failed', 'Please log in with your username and password.');
          await setSid(null); // Clear invalid SID
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }
    try {
      await login(email, password);
      // The biometricAvailable state is updated by the useEffect hook.
      // If it's not available, the prompt should not appear.
      // If it is available, the user has already enabled it.
      // So, no need to ask again.
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'An unexpected error occurred. Please try again.'
      );
    }
  };

  if (isLoading && !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (user) {
    return <Redirect href={'/(tabs)' as any} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <StyledInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <StyledInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Link href="/forgetpassword" asChild>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
        <View style={styles.loginButtonContainer}>
          <StyledButton title="Login" onPress={handleLogin} style={{ flex: 1 }} />
          {biometricAvailable && (
            <TouchableOpacity onPress={biometricLogin} style={styles.biometricIconContainer}>
              <Icon name="fingerprint" size={32} color="#4f46e5" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#4f46e5',
    marginBottom: 24,
    fontWeight: '600',
  },
  loginButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  biometricIconContainer: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
  },
});
