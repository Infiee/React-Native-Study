import { createMMKV } from 'react-native-mmkv';
import { StateStorage, createJSONStorage } from 'zustand/middleware';

// Create a single MMKV instance for all stores
export const mmkvStorage = createMMKV({
  id: 'expo-im-storage',
  encryptionKey: 'expo-im-encryption-key', // In production, use a more secure key
});

/**
 * MMKV Storage Adapter for Zustand Persist Middleware
 * Provides a high-performance storage interface compatible with zustand's persist middleware
 */
const mmkvStorageAdapter: StateStorage = {
  setItem: (name, value) => {
    mmkvStorage.set(name, value);
  },
  getItem: (name) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    mmkvStorage.remove(name);
  },
};

/**
 * Export createJSONStorage wrapper for use in stores
 * This properly handles JSON serialization and type compatibility
 */
export const storage = createJSONStorage(() => mmkvStorageAdapter);

/**
 * Utility function to clear all stored data (useful for logout)
 */
export const clearAllStorage = () => {
  mmkvStorage.clearAll();
};

/**
 * Utility function to get all keys in storage
 */
export const getAllStorageKeys = () => {
  return mmkvStorage.getAllKeys();
};
