import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import api, { getSid, setSid, setupAxiosInterceptors } from '../services/api';
import { getCurrentUserInfo, UserProfile } from '../services/profile';

const AUTH_STORAGE_KEY = 'prime_erp_auth_data';


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

  const router = useRouter();
  const logout = React.useCallback(async () => {
    setUser(null);
    setIsLoading(false);
    (async () => {
      try {
        await api.logout();
        await AsyncStorage.removeItem('LOCATION_TRACKING_CREDENTIALS');
        console.log('Background cleanup successful.');
        router.replace('/login'); // Navigate to login screen after logout
      } catch (error) {
        console.error('Background logout cleanup failed:', error);
      }
    })();
  }, [router]);

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
      // The SID is already handled by `setSid` in `services/api.ts`
      // No need to store separate API keys/secrets for biometric login here.
      // The `getSid` and `setSid` functions now use SecureStore directly.


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
