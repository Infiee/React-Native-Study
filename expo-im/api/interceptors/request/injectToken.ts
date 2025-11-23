// import { useAuthStore } from '@/src/store/authStore'; // 假设使用 Zustand
import { InternalAxiosRequestConfig } from 'axios';

export const injectToken = (config: InternalAxiosRequestConfig) => {
    // 注意：这里直接读取 Store 的非 Hook 状态（Zustand 支持）
    // 避免了循环依赖，因为我们只引用 getState 方法，而不是整个 Store 实例
    // const token = useAuthStore.getState().token;

    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
};