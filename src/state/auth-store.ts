import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse } from '../types/api';

type AuthState = {
  token?: string;
  displayName?: string;
  email?: string;
  userId?: number;
  setAuth: (payload: AuthResponse) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: undefined,
      displayName: undefined,
      email: undefined,
      userId: undefined,
      setAuth: (payload) =>
        set({
          token: payload.token,
          displayName: payload.displayName,
          email: payload.email,
          userId: payload.userId
        }),
      clear: () => set({ token: undefined, displayName: undefined, email: undefined, userId: undefined })
    }),
    {
      name: 'rph-auth',
      partialize: (state) => ({ token: state.token, displayName: state.displayName, email: state.email, userId: state.userId })
    }
  )
);

export const getAuthToken = () => useAuthStore.getState().token;
