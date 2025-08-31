import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as Auth from '../services/auth';

export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      async login(username: string, password: string) {
        const res = await Auth.login(username, password);
        const { token, id, username: userUsername, email, firstName, lastName } = res;
        set({ 
          token, 
          isAuthenticated: true,
          user: { id, username: userUsername, email, firstName, lastName }
        });
      },
      logout() {
        set({ token: null, isAuthenticated: false, user: null });
      },
    }),
    { name: 'auth-store' }
  )
); 