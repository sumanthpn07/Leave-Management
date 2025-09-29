'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User, LoginCredentials, AuthResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
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
    // Demo login - bypass API call for development
    if (credentials.email === 'demo@company.com' && credentials.password === 'demo123') {
      const demoUser: User = {
        id: '1',
        email: 'demo@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        department: 'Engineering'
      };
      
      const demoToken = 'demo-jwt-token-123';
      
      localStorage.setItem('authToken', demoToken);
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('currentUser', JSON.stringify({ id: '1', role: 'EMPLOYEE' }));
      
      toast.success('Login successful');
      router.push('/dashboard');
      return;
    }
    
    // Manager demo login
    if (credentials.email === 'manager@company.com' && credentials.password === 'manager123') {
      const managerUser: User = {
        id: '2',
        email: 'manager@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'MANAGER',
        department: 'Engineering'
      };
      
      const managerToken = 'manager-jwt-token-456';
      
      localStorage.setItem('authToken', managerToken);
      setToken(managerToken);
      setUser(managerUser);
      localStorage.setItem('currentUser', JSON.stringify({ id: '2', role: 'MANAGER' }));
      
      toast.success('Login successful');
      router.push('/dashboard');
      return;
    }
    
    // Admin demo login
    if (credentials.email === 'admin@company.com' && credentials.password === 'admin123') {
      const adminUser: User = {
        id: '3',
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        department: 'HR'
      };
      
      const adminToken = 'admin-jwt-token-789';
      
      localStorage.setItem('authToken', adminToken);
      setToken(adminToken);
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify({ id: '3', role: 'ADMIN' }));
      
      toast.success('Login successful');
      router.push('/dashboard');
      return;
    }
    
    // If not demo credentials, show error
    toast.error('Invalid credentials. Use demo accounts for testing.');
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
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