import { useAuthStore } from '@/store';
import { InternalAxiosRequestConfig } from 'axios';

/**
 * Request Interceptor - Inject authentication token
 * Reads token from auth store and adds to request headers
 */
export const injectToken = (config: InternalAxiosRequestConfig) => {
  // Read token from auth store using getState() to avoid React hooks
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
