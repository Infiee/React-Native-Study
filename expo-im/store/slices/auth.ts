import { storage } from '@/config/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AuthStore, UserInfo } from '../types';

/**
 * Auth Store - Manages user authentication state
 *
 * Features:
 * - Persistent storage with MMKV
 * - Immutable updates with immer
 * - Type-safe authentication state
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      // Initial State
      token: null,
      isAuthenticated: false,
      userInfo: null,

      // Actions
      login: (token: string, userInfo: UserInfo) => {
        set((state) => {
          state.token = token;
          state.isAuthenticated = true;
          state.userInfo = userInfo;
        });
      },

      logout: () => {
        set((state) => {
          state.token = null;
          state.isAuthenticated = false;
          state.userInfo = null;
        });
      },

      updateToken: (token: string) => {
        set((state) => {
          state.token = token;
        });
      },

      setUserInfo: (userInfo: UserInfo) => {
        set((state) => {
          state.userInfo = userInfo;
        });
      },
    })),
    {
      name: 'auth-storage', // unique name for this store
      storage,
    }
  )
);
