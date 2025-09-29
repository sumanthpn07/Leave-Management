'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      try {
        const response = await api.get('/auth/me');
        return response.data;
      } catch (error) {
        localStorage.removeItem('authToken');
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Login successful');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Registration successful');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const login = (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const register = (data: RegisterData) => {
    return registerMutation.mutateAsync(data);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    queryClient.clear();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};