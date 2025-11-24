import { useAuthStore } from './slices/auth';
import { useIMStore } from './slices/im';
import { useUserStore } from './slices/user';

/**
 * Global Store Actions
 * 集中管理跨 store 的操作，避免代码重复和职责混乱
 */

/**
 * 清空所有 stores 的数据
 * 用于登出或者处理 401 错误
 *
 * 注意：使用 getState() 而不是 hooks，因为这些函数可能在 React 组件外调用
 */
export const clearAllStores = () => {
  useAuthStore.getState().logout();
  useUserStore.getState().clearUserData();
  useIMStore.getState().clearIMData();
};

/**
 * 重置应用到初始状态
 * 除了清空 stores，还可以添加其他重置逻辑
 */
export const resetApp = () => {
  clearAllStores();
  // 可以在这里添加其他重置逻辑，比如：
  // - 清空缓存
  // - 重置路由
  // - 清空本地通知等
};
