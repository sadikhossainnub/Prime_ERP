import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../services/api';
import { getSession } from '../../services/auth';

interface AuthContextProps {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
  login: async (email: string, password: string) => { },
  logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        console.log('Loading session...');
        const session = await getSession();
        console.log('Session loaded:', session);
        
        // Validate session has required fields
        if (session && session.sid && session.email) {
          console.log('Valid session found, setting user');
          setUser(session);
        } else {
          console.log('No valid session found, user will be null');
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading session:', error);
        setUser(null);
      } finally {
        console.log('Setting loading to false, user state:', user);
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await api.login(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login error (e.g., display an error message)
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle logout error (e.g., display an error message)
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
