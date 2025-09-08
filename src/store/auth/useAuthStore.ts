import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CookieUser, LegacyUser, Permission } from '../../types/auth';
import Cookies from 'js-cookie';

type AuthStore = {
  cookieUser: CookieUser | null;
  setCookieUser: (cookieUser: CookieUser) => void;

  legacyUser: LegacyUser | null;
  setLegacyUser: (legacyUser: LegacyUser) => void;
  logout: () => void;

  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    devtools((set) => ({
      cookieUser: null,
      setCookieUser: (cookieUser) => set({ cookieUser }),

      legacyUser: null,
      setLegacyUser: (legacyUser) => {
        set({ legacyUser });
      },
      logout: () => {
        set({ legacyUser: null, permissions: [] });
        Cookies.remove('userData');
        window.location.replace('http://localhost:5173');
      },

      permissions: [],
      setPermissions: (permissions) => set({ permissions }),
    })),
    { name: 'auth-store' },
  ),
);
