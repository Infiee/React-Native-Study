import { updateUserProfile, updateUserSettings, uploadAvatar } from '@/api/endpoints/user';
import { log } from '@/config/logger';
import { queryClient } from '@/config/queryClient';
import { useUserStore } from '@/store/slices/user';
import type { UserProfile, UserSettings } from '@/store/types';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { userQueryKeys } from './useUser';

/**
 * useUpdateProfile Hook - 更新用户资料
 *
 * Features:
 * - 使用 React Query Mutation 管理异步状态
 * - 自动失效相关查询缓存
 * - 乐观更新 Zustand Store
 * - 完整的错误处理和日志记录
 *
 * @example
 * const { mutate, mutateAsync, isPending } = useUpdateProfile();
 *
 * // 使用 mutate (不需要等待)
 * mutate({ nickname: '新昵称' });
 *
 * // 使用 mutateAsync (需要等待结果)
 * try {
 *   const updated = await mutateAsync({ nickname: '新昵称' });
 *   Alert.alert('成功', '资料已更新');
 * } catch (error) {
 *   Alert.alert('失败', '更新失败');
 * }
 */
export const useUpdateProfile = () => {
  const setProfile = useUserStore((state) => state.setProfile);
  const updateProfileStore = useUserStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      log.info('Updating user profile...', { updates });
      const updatedProfile = await updateUserProfile(updates);
      log.info('User profile updated successfully');
      return updatedProfile;
    },

    // 乐观更新：在请求发送前先更新 UI
    onMutate: async (updates) => {
      // 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: userQueryKeys.profile() });

      // 获取当前缓存的数据
      const previousProfile = queryClient.getQueryData<UserProfile>(userQueryKeys.profile());

      // 乐观更新缓存
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(
          userQueryKeys.profile(),
          { ...previousProfile, ...updates }
        );
        // 同时更新 Zustand Store
        updateProfileStore(updates);
      }

      // 返回上下文对象，用于回滚
      return { previousProfile };
    },

    // 成功时的处理
    onSuccess: (data) => {
      // 更新缓存为服务器返回的最新数据
      queryClient.setQueryData(userQueryKeys.profile(), data);
      // 更新 Zustand Store
      setProfile(data);

      // 可选：失效其他相关查询
      // queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },

    // 失败时回滚
    onError: (error, variables, context) => {
      log.error('Failed to update user profile', error);

      // 回滚到之前的数据
      if (context?.previousProfile) {
        queryClient.setQueryData(userQueryKeys.profile(), context.previousProfile);
        setProfile(context.previousProfile);
      }
    },

    // 无论成功失败都执行
    onSettled: () => {
      // 重新获取数据以确保与服务器同步
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
};

/**
 * useUploadAvatar Hook - 上传用户头像
 *
 * @example
 * const { mutateAsync, isPending } = useUploadAvatar();
 *
 * const handleUpload = async (file: FormData) => {
 *   try {
 *     const avatarUrl = await mutateAsync(file);
 *     Alert.alert('成功', '头像已更新');
 *   } catch (error) {
 *     Alert.alert('失败', '上传失败');
 *   }
 * };
 */
export const useUploadAvatar = () => {
  const updateProfileStore = useUserStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: async (file: FormData) => {
      log.info('Uploading avatar...');
      const { url } = await uploadAvatar(file);
      log.info('Avatar uploaded successfully', { url });
      return url;
    },

    onSuccess: (url) => {
      // 更新缓存中的头像 URL
      const currentProfile = queryClient.getQueryData<UserProfile>(userQueryKeys.profile());
      if (currentProfile) {
        queryClient.setQueryData<UserProfile>(
          userQueryKeys.profile(),
          { ...currentProfile, avatar: url }
        );
      }

      // 更新 Zustand Store
      updateProfileStore({ avatar: url });
    },

    onError: (error) => {
      log.error('Failed to upload avatar', error);
    },

    onSettled: () => {
      // 刷新用户资料
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
};

/**
 * useUpdateSettings Hook - 更新用户设置
 *
 * @example
 * const { mutate, isPending } = useUpdateSettings();
 *
 * mutate({
 *   notifications: true,
 *   soundEnabled: false
 * });
 */
export const useUpdateSettings = () => {
  const setSettings = useUserStore((state) => state.setSettings);

  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      log.info('Updating user settings...', { updates });
      const updatedSettings = await updateUserSettings(updates);
      log.info('User settings updated successfully');
      return updatedSettings;
    },

    // 乐观更新
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.settings() });

      const previousSettings = queryClient.getQueryData<UserSettings>(userQueryKeys.settings());

      if (previousSettings) {
        const optimisticSettings = { ...previousSettings, ...updates };
        queryClient.setQueryData<UserSettings>(userQueryKeys.settings(), optimisticSettings);
        setSettings(updates);
      }

      return { previousSettings };
    },

    onSuccess: (data) => {
      queryClient.setQueryData(userQueryKeys.settings(), data);
      setSettings(data);
    },

    onError: (error, variables, context) => {
      log.error('Failed to update user settings', error);

      if (context?.previousSettings) {
        queryClient.setQueryData(userQueryKeys.settings(), context.previousSettings);
        setSettings(context.previousSettings);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.settings() });
    },
  });
};

/**
 * useUserAction Hook - 组合所有用户操作
 *
 * 提供统一的接口访问所有用户相关的修改操作
 *
 * @example
 * const {
 *   updateProfile,
 *   uploadAvatar,
 *   updateSettings,
 *   clearUser,
 *   isUpdating
 * } = useUserAction();
 */
export const useUserAction = () => {
  const clearUserData = useUserStore((state) => state.clearUserData);

  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const updateSettingsMutation = useUpdateSettings();

  /**
   * 清除用户数据（登出时使用）
   * 同时清除 Zustand Store 和 React Query 缓存
   */
  const clearUser = useCallback(() => {
    log.info('Clearing user data...');

    // 清除 Zustand Store
    clearUserData();

    // 清除所有用户相关的查询缓存
    queryClient.removeQueries({ queryKey: userQueryKeys.all });

    log.info('User data cleared successfully');
  }, [clearUserData]);

  /**
   * 重置所有用户相关的查询状态
   */
  const resetQueries = useCallback(() => {
    queryClient.resetQueries({ queryKey: userQueryKeys.all });
  }, []);

  return {
    // Mutation 方法
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,

    uploadAvatar: uploadAvatarMutation.mutate,
    uploadAvatarAsync: uploadAvatarMutation.mutateAsync,

    updateSettings: updateSettingsMutation.mutate,
    updateSettingsAsync: updateSettingsMutation.mutateAsync,

    // 加载状态
    isUpdatingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isUpdatingSettings: updateSettingsMutation.isPending,
    isUpdating:
      updateProfileMutation.isPending ||
      uploadAvatarMutation.isPending ||
      updateSettingsMutation.isPending,

    // 错误状态
    updateProfileError: updateProfileMutation.error,
    uploadAvatarError: uploadAvatarMutation.error,
    updateSettingsError: updateSettingsMutation.error,

    // 重置方法
    resetUpdateProfile: updateProfileMutation.reset,
    resetUploadAvatar: uploadAvatarMutation.reset,
    resetUpdateSettings: updateSettingsMutation.reset,

    // 副作用方法
    clearUser,
    resetQueries,
  };
};
