import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getSid, setSid } from '../../services/api'; // Import getSid and setSid
import { getCurrentUserInfo, UserProfile } from '../../services/profile'; // Import UserProfile

const AUTH_STORAGE_KEY = 'prime_erp_auth_data'; // Consider if this is still needed as SID is stored in API service

interface AuthContextProps {
  user: UserProfile | null; // Use UserProfile type
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: false,
  login: async (email: string, password: string) => { },
  logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null); // Use UserProfile type
  const [isLoading, setIsLoading] = useState(true); // Set to true initially
  
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const sid = await getSid(); // Get SID from storage
        if (sid) {
          // If SID exists, try to fetch user info to validate session
          const userInfo = await getCurrentUserInfo();
          setUser(userInfo);
          console.log('Session restored for user:', userInfo.email);
        }
      } catch (error) {
        console.error('Failed to load auth data or validate session:', error);
        await setSid(null); // Clear invalid SID
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
      await api.login(email, password); // API service now handles SID storage
      const userInfo = await getCurrentUserInfo(); // Fetch user info after successful login
      setUser(userInfo);
      console.log('Login successful for user:', userInfo.email);
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null); // Ensure user is null on login failure
      await setSid(null); // Clear any partial SID on login failure
      throw error; // Re-throw to let UI handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout(); // API service now handles SID clearing
      setUser(null);
      console.log('Logout successful.');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local session for safety
      setUser(null);
      await setSid(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
