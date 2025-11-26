import { getCurrentUser, getUserById, getUserSettings } from '@/api/endpoints/user';
import { log } from '@/config/logger';
import { cachePresets } from '@/config/queryPresets';
import { useUserStore } from '@/store/slices/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Query Keys for User-related queries
 * 统一管理 Query Keys，便于缓存管理和失效控制
 */
export const userQueryKeys = {
  all: ['user'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
  profileById: (id: string) => [...userQueryKeys.all, 'profile', id] as const,
  settings: () => [...userQueryKeys.all, 'settings'] as const,
};

/**
 * useUserProfile Hook - 获取当前用户信息
 *
 * Features:
 * - 使用 React Query 管理缓存和重新获取
 * - 自动同步到 Zustand Store
 * - 支持 staleTime 和 cacheTime 配置
 *
 * @example
 * const { data: profile, isLoading, error, refetch } = useUserProfile();
 */
export const useUserProfile = () => {
  const setProfile = useUserStore((state) => state.setProfile);
  const setLoading = useUserStore((state) => state.setLoading);

  const query = useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: async () => {
      log.info('Fetching current user profile...');
      const profile = await getCurrentUser();
      log.info('User profile fetched successfully', { userId: profile.id });
      return profile;
    },
    // ...cachePresets.normal, // 用户资料使用普通缓存策略
  });

  // 同步 React Query 数据到 Zustand Store
  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  // 同步加载状态到 Zustand Store
  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return query;
};

/**
 * useUserById Hook - 根据 ID 获取用户信息
 *
 * @param userId - 用户 ID
 * @param enabled - 是否启用查询，默认为 true
 *
 * @example
 * const { data: user, isLoading } = useUserById('user123');
 * // 条件查询
 * const { data: user } = useUserById(userId, { enabled: !!userId });
 */
export const useUserById = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: userQueryKeys.profileById(userId),
    queryFn: async () => {
      log.info('Fetching user by ID', { userId });
      const profile = await getUserById(userId);
      log.info('User fetched successfully', { userId });
      return profile;
    },
    ...cachePresets.normal, // 用户资料使用普通缓存策略
    enabled: (options?.enabled ?? true) && !!userId,
  });
};

/**
 * useUserSettings Hook - 获取用户设置
 *
 * Features:
 * - 自动同步到 Zustand Store
 * - 支持独立的缓存控制
 *
 * @example
 * const { data: settings, isLoading, refetch } = useUserSettings();
 */
export const useUserSettings = () => {
  const setSettings = useUserStore((state) => state.setSettings);

  const query = useQuery({
    queryKey: userQueryKeys.settings(),
    queryFn: async () => {
      log.info('Fetching user settings...');
      const settings = await getUserSettings();
      log.info('User settings fetched successfully');
      return settings;
    },
    ...cachePresets.static, // 设置数据变化少，使用静态缓存策略
  });

  // 同步到 Zustand Store
  useEffect(() => {
    if (query.data) {
      setSettings(query.data);
    }
  }, [query.data, setSettings]);

  return query;
};

/**
 * useUser Hook - 组合 Hook
 *
 * 同时获取用户资料和设置
 *
 * @example
 * const { profile, settings, isLoading, refetchAll } = useUser();
 */
export const useUser = () => {
  const queryClient = useQueryClient(); // ✅ 在顶层调用
  const profileQuery = useUserProfile();
  const settingsQuery = useUserSettings();

  // 获取 Zustand Store 中的数据（作为 fallback）
  const storeProfile = useUserStore((state) => state.profile);
  const storeSettings = useUserStore((state) => state.settings);

  /**
   * 刷新所有用户相关数据
   */
  const refetchAll = async () => {
    await Promise.all([
      profileQuery.refetch(),
      settingsQuery.refetch(),
    ]);
  };

  /**
   * 清除所有用户相关缓存
   */
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
  };

  return {
    // React Query 数据 (优先使用)
    profile: profileQuery.data ?? storeProfile,
    settings: settingsQuery.data ?? storeSettings,

    // 加载状态
    isLoading: profileQuery.isLoading || settingsQuery.isLoading,
    isProfileLoading: profileQuery.isLoading,
    isSettingsLoading: settingsQuery.isLoading,

    // 错误状态
    error: profileQuery.error || settingsQuery.error,
    profileError: profileQuery.error,
    settingsError: settingsQuery.error,

    // 操作方法
    refetchProfile: profileQuery.refetch,
    refetchSettings: settingsQuery.refetch,
    refetchAll,
    invalidateAll,
  };
};
