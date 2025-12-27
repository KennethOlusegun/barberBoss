import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { getData, saveData, removeData } from '../utils/storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  businessId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token on mount
  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = useCallback(async () => {
    try {
      const token = await getData<string>('authToken');
      const userData = await getData<User>('user');

      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
    } finally {
      // IMPORTANTE: Sempre setar isLoading como false
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      await saveData('authToken', access_token);
      await saveData('user', userData);

      setUser(userData);
    } catch (error: any) {
      throw {
        statusCode: error.response?.status,
        message: error.response?.data?.message || 'Erro ao fazer login',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post('/auth/register', {
          email,
          password,
          name,
        });

        const { access_token, user: userData } = response.data;

        await saveData('authToken', access_token);
        await saveData('user', userData);

        setUser(userData);
      } catch (error: any) {
        throw {
          statusCode: error.response?.status,
          message: error.response?.data?.message || 'Erro ao criar conta',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
      await removeData('authToken');
      await removeData('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      await removeData('authToken');
      await removeData('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: Boolean(user),
    signIn,
    signUp,
    signOut,
    restoreToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};