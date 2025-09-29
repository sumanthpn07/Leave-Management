'use client';

import { useAuthContext } from '@/contexts/auth-context';

export const useAuth = () => {
  const context = useAuthContext();

  return {
    ...context,
    isLoginLoading: false, // For backward compatibility
    isRegisterLoading: false, // For backward compatibility
  };
};