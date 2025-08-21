import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import api, { getSid, setSid, setupAxiosInterceptors } from '../services/api';
import { getCurrentUserInfo, UserProfile } from '../services/profile';

const AUTH_STORAGE_KEY = 'prime_erp_auth_data';

import * as SecureStore from 'expo-secure-store';

interface AuthContextProps {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: false,
  login: async () => null,
  logout: async () => {},
  setUser: () => {},
  setIsLoading: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutRef = useRef<() => Promise<void> | undefined>(undefined);

  const logout = React.useCallback(async () => {
    setUser(null);
    setIsLoading(false);
    (async () => {
      try {
        await api.logout();
        await AsyncStorage.removeItem('LOCATION_TRACKING_CREDENTIALS');
        console.log('Background cleanup successful.');
      } catch (error) {
        console.error('Background logout cleanup failed:', error);
      }
    })();
  }, []);

  logoutRef.current = logout;

  useEffect(() => {
    setupAxiosInterceptors(() => logoutRef.current?.());
    
    const loadAuthData = async () => {
      try {
        const sid = await getSid();
        if (sid) {
          const userInfo = await getCurrentUserInfo();
          setUser(userInfo);
          console.log('Session restored for user:', userInfo.email);
        }
      } catch (error) {
        console.error('Failed to load auth data or validate session:', error);
        await setSid(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      const userInfo = await getCurrentUserInfo();
      setUser(userInfo);
      console.log('Login successful for user:', userInfo.email);

      // After successful login, you would ideally get the API key and secret.
      // For this example, we'll assume you get them from the login response or another API call.
      // We'll use placeholders here.
      const apiKey = 'dummy_api_key'; // Replace with actual API key retrieval
      const apiSecret = 'dummy_api_secret'; // Replace with actual API secret retrieval

      await SecureStore.setItemAsync('api_key', apiKey);
      await SecureStore.setItemAsync('api_secret', apiSecret);


      try {
        await AsyncStorage.setItem('LOCATION_TRACKING_CREDENTIALS', JSON.stringify({ email, password }));
        console.log('Credentials saved for location tracking.');
      } catch (storageError) {
        console.error('Failed to save credentials for location tracking:', storageError);
      }
      return userInfo;
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      await setSid(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
