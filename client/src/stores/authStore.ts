import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import {
  authPersistStorage,
  clearAuthItems,
  setAuthItem,
  setRememberMe,
} from '@/lib/authStorage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isStaffOrAdmin: () => boolean;
  isAdmin: () => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken, rememberMe = true) => {
        setRememberMe(rememberMe);
        setAuthItem('accessToken', accessToken);
        setAuthItem('refreshToken', refreshToken);
        set({ user, accessToken, refreshToken });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearAuthItems(['accessToken', 'refreshToken']);
        set({ user: null, accessToken: null, refreshToken: null });
      },
      isStaffOrAdmin: () => {
        const role = get().user?.role;
        return role === 'Staff' || role === 'Admin';
      },
      isAdmin: () => get().user?.role === 'Admin',
      hasRole: (...roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name: 'webshop-auth',
      storage: createJSONStorage(() => authPersistStorage),
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
);
