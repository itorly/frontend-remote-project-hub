import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse } from '../types/api';

type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  displayName?: string;
  email?: string;
  userId?: number;
  setAuth: (payload: AuthResponse) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      displayName: undefined,
      email: undefined,
      userId: undefined,
      setAuth: (payload) =>
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          displayName: payload.displayName,
          email: payload.email,
          userId: payload.userId
        }),
      clear: () =>
        set({
          accessToken: undefined,
          refreshToken: undefined,
          displayName: undefined,
          email: undefined,
          userId: undefined
        })
    }),
    {
      name: 'rph-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        displayName: state.displayName,
        email: state.email,
        userId: state.userId
      })
    }
  )
);

export const getAuthToken = () => useAuthStore.getState().accessToken;
export const getRefreshToken = () => useAuthStore.getState().refreshToken;
