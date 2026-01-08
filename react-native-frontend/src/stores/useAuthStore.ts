import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'customer' | 'handyman' | 'admin';
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isHandyman: () => boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
      isHandyman: () => get().user?.role === 'handyman',
      isAdmin: () => get().user?.role === 'admin',
      isCustomer: () => get().user?.role === 'customer',
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
