import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as Auth from '../services/auth';

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      async login(username: string, password: string) {
        const res = await Auth.login(username, password);
        const { token } = res;
        set({ token, isAuthenticated: true });
      },
      logout() {
        set({ token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-store' }
  )
); 