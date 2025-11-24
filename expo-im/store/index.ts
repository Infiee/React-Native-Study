/**
 * Store Index - Central export for all stores
 *
 * Usage:
 * import { useAuthStore, useUserStore, useIMStore, useAppStore } from '@/store';
 */

// Store exports
export { useAppStore } from './slices/app';
export { useAuthStore } from './slices/auth';
export { useIMStore } from './slices/im';
export { useUserStore } from './slices/user';

// Global actions
export { clearAllStores, resetApp } from './actions';

// Type exports
export type {
  AppActions, AppState,
  // App types
  AppStore, AuthActions, AuthState,
  // Auth types
  AuthStore, IMActions,
  IMConnectionStatus,
  IMConversation,
  IMMessage, IMState,
  // IM types
  IMStore, Language,
  NetworkStatus, ThemeMode, UserActions, UserInfo, UserProfile,
  UserSettings, UserState,
  // User types
  UserStore
} from './types';

// Storage utilities
export {
  clearAllStorage,
  getAllStorageKeys, mmkvStorage,
  storage
} from '../config/storage';

