'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { User, LoginCredentials, AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authApi.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      const authData: AuthResponse = response.data;
      
      if (authData.success) {
        const { user: userData, token: authToken } = authData.data;
        
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setUser(userData);
        
        toast.success('Login successful');
        router.push('/dashboard');
      } else {
        throw new Error(authData.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    try {
      // Clear all localStorage data
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      
      // Clear any cached API data
      // This will force fresh data fetch on next login
      if (typeof window !== 'undefined') {
        // Clear any cached data in browser storage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('leaves') || key.includes('balances') || key.includes('approvals') || key.includes('admin'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
    
    // Clear React Query cache
    queryClient.clear();
    
    setToken(null);
    setUser(null);
    router.push('/auth/login');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
