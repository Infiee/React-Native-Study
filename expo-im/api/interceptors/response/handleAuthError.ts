import { clearAllStores } from '@/store';
import { AxiosError } from 'axios';

/**
 * Response Interceptor - Handle authentication errors
 * Triggers logout on 401 and clears all stores
 */
export const handleAuthError = async (error: AxiosError) => {
  const originalRequest = error.config;

  if (error.response?.status === 401) {
    // Handle 401 Unauthorized - user session is invalid
    // Clear all stores using centralized action
    clearAllStores();

    // TODO: Navigate to login screen
    // router.replace('/login');
  }

  return Promise.reject(error);
};
