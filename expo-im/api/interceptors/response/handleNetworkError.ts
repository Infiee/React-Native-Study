import { AxiosError } from 'axios';
// import { Toast } from '@/src/lib/toast'; // 封装好的 UI 库

export const handleNetworkError = (error: AxiosError) => {
  if (!error.response) {
    // Toast.show('网络连接失败，请检查您的网络');
    return Promise.reject(error);
  }

  // 可以在这里过滤掉 401，交给专门的 Auth 拦截器处理
  if (error.response.status !== 401) {
    const message = (error.response.data as any)?.message || '未知错误';
    // Toast.show(message);
  }

  return Promise.reject(error);
};