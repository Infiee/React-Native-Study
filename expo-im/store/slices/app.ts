import { storage } from '@/config/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AppStore, Language, NetworkStatus, ThemeMode } from '../types';

/**
 * App Store - Manages application-wide settings and preferences
 *
 * Features:
 * - Persistent storage with MMKV
 * - Immutable updates with immer
 * - Theme, language, and app settings management
 */
export const useAppStore = create<AppStore>()(
  persist(
    immer((set) => ({
      // Initial State
      theme: 'system',
      language: 'zh-CN',
      networkStatus: 'unknown',
      isFirstLaunch: true,

      // Actions
      setTheme: (theme: ThemeMode) => {
        set((state) => {
          state.theme = theme;
        });
      },

      setLanguage: (language: Language) => {
        set((state) => {
          state.language = language;
        });
      },

      setNetworkStatus: (status: NetworkStatus) => {
        set((state) => {
          state.networkStatus = status;
        });
      },

      setFirstLaunch: (isFirst: boolean) => {
        set((state) => {
          state.isFirstLaunch = isFirst;
        });
      },
    })),
    {
      name: 'app-storage', // unique name for this store
      storage,
    }
  )
);
