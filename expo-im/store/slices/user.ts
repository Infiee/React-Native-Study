import { storage } from '@/config/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { UserProfile, UserSettings, UserStore } from '../types';

// Default user settings
const defaultSettings: UserSettings = {
  notifications: true,
  soundEnabled: true,
  vibrationEnabled: true,
  messagePreview: true,
};

/**
 * User Store - Manages user profile and settings
 *
 * Features:
 * - Persistent storage with MMKV
 * - Immutable updates with immer
 * - User profile and settings management
 */
export const useUserStore = create<UserStore>()(
  persist(
    immer((set) => ({
      // Initial State
      profile: null,
      settings: defaultSettings,
      loading: false,

      // Actions
      setProfile: (profile: UserProfile) => {
        set((state) => {
          state.profile = profile;
        });
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set((state) => {
          if (state.profile) {
            state.profile = { ...state.profile, ...updates };
          }
        });
      },

      setSettings: (settings: Partial<UserSettings>) => {
        set((state) => {
          state.settings = { ...state.settings, ...settings };
        });
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.loading = loading;
        });
      },

      clearUserData: () => {
        set((state) => {
          state.profile = null;
          state.settings = defaultSettings;
          state.loading = false;
        });
      },
    })),
    {
      name: 'user-storage', // unique name for this store
      storage,
    }
  )
);
