import React, { createContext, useContext, useState } from 'react';
import api from '../../services/api';

interface AuthContextProps {
  user: any;
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
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await api.login(email, password);
      // Set user data for UI purposes - using token authentication
      setUser({
        email: email,
        name: userData.name || userData.full_name || email,
        full_name: userData.full_name || userData.name || email,
        authenticated: true,
        authMethod: 'token', // Indicate we're using token auth
      });
      console.log('Token-based authentication successful');
    } catch (error) {
      console.error('Token-based login failed:', error);
      throw error; // Re-throw to let UI handle the error
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
      // Clear user even if logout API fails
      setUser(null);
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
