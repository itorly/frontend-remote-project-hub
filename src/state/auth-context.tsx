import { ReactNode, createContext, useContext, useEffect, useMemo } from 'react';
import { authApi } from '../api/client';
import { AuthResponse } from '../types/api';
import { useAuthStore } from './auth-store';

interface AuthContextValue {
  accessToken?: string;
  refreshToken?: string;
  displayName?: string;
  email?: string;
  userId?: number;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.accessToken) return;
    // On token changes we could preload user profile; not implemented here.
  }, [store.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: store.accessToken,
      refreshToken: store.refreshToken,
      displayName: store.displayName,
      email: store.email,
      userId: store.userId,
      isAuthenticated: Boolean(store.accessToken),
      setAuth: store.setAuth,
      logout: async () => {
        try {
          if (store.refreshToken) {
            await authApi.logout({ refreshToken: store.refreshToken });
          }
        } finally {
          store.clear();
          if (window.location.pathname !== '/login') {
            window.location.assign('/login');
          }
        }
      }
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
