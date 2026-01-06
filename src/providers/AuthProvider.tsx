import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthResponse } from "../api/types";

type AuthState = {
  token: string | null;
  user: Pick<AuthResponse, "email" | "displayName" | "userId"> | null;
};

type AuthContextValue = AuthState & {
  login: (data: AuthResponse) => void;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "kanban.auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as AuthState;
      } catch (error) {
        console.error("Failed to parse auth state", error);
      }
    }
    return { token: null, user: null };
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: authState.token,
      user: authState.user,
      login: (data: AuthResponse) => {
        setAuthState({
          token: data.token,
          user: {
            email: data.email,
            displayName: data.displayName,
            userId: data.userId,
          },
        });
      },
      logout: () => {
        setAuthState({ token: null, user: null });
        localStorage.removeItem(AUTH_STORAGE_KEY);
      },
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
