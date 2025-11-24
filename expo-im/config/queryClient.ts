/**
 * React Query 配置
 * 创建并配置 QueryClient 实例
 */
import { QueryClient } from '@tanstack/react-query';

/**
 * 创建 QueryClient 实例
 * 配置默认选项，如重试策略、缓存时间等
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 失败时重试次数
      retry: 2,
      // 重试延迟（毫秒）
      retryDelay: 1000,
      // 数据缓存时间（毫秒），5分钟后清理不活跃的缓存
      gcTime: 5 * 60 * 1000,
      // 30秒内认为数据是新鲜的，不重新请求
      staleTime: 30 * 1000,
      // 窗口失焦时不重新获取数据
      refetchOnWindowFocus: false,
      // 网络重新连接时不自动重新获取
      refetchOnReconnect: false,
      // 组件挂载时不自动重新获取，配合 staleTime 使用
      refetchOnMount: false,
    },
    mutations: {
      // mutation 失败时重试次数
      retry: 2,
      // 重试延迟（毫秒）
      retryDelay: 1000,
    },
  },
});

