import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react';
import { AuthResponse } from '../types/api';
import { useAuthStore } from './auth-store';

interface AuthContextValue {
  token?: string;
  displayName?: string;
  email?: string;
  userId?: number;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.token) return;
    // On token changes we could preload user profile; not implemented here.
  }, [store.token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: store.token,
      displayName: store.displayName,
      email: store.email,
      userId: store.userId,
      isAuthenticated: Boolean(store.token),
      setAuth: store.setAuth,
      logout: store.clear
    }),
    [store]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
