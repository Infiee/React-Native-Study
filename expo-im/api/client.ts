import axios from 'axios';
import { injectToken } from './interceptors/request/injectToken';
import { handleAuthError } from './interceptors/response/handleAuthError';
import { handleNetworkError } from './interceptors/response/handleNetworkError';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// --- 注册拦截器 (类似于后端的 Middleware 注册) ---

// Request Interceptors
client.interceptors.request.use(injectToken);

// Response Interceptors (注意顺序：先处理特定逻辑，再处理通用逻辑)
client.interceptors.response.use(
  (response) => response, // 成功直接返回
  async (error) => {
    // 链式处理错误：先看是不是 Auth 问题，再看是不是网络问题
    // 注意：Axios 的 error interceptor 并不像 Express middleware 那样 next()
    // 这里通常需要自行编排，或者在一个统一的 Error Handler 中根据 switch case 处理

    try {
      await handleAuthError(error); // 如果是 401，这里可能会处理跳转
    } catch (e) {
      // 如果不是 401，或者 401 处理完了，继续抛出给 UI 层或下一个拦截器
      return handleNetworkError(error);
    }
  }
);