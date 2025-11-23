import { AxiosError } from 'axios';
// import { useAuthStore } from '@/src/store/authStore';

export const handleAuthError = async (error: AxiosError) => {
  const originalRequest = error.config;

  if (error.response?.status === 401) {
    // 这里可以做复杂的 Refresh Token 逻辑
    // 或者简单粗暴的登出
    // useAuthStore.getState().logout();
    // router.replace('/login');
  }

  return Promise.reject(error);
};
