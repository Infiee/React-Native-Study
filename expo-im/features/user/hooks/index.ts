/**
 * User Hooks - 统一导出
 *
 * Queries (useUser.ts):
 * - useUserProfile: 获取当前用户资料
 * - useUserById: 根据 ID 获取用户资料
 * - useUserSettings: 获取用户设置
 * - useUser: 组合 hook，同时获取资料和设置
 *
 * Mutations (useUserAction.ts):
 * - useUpdateProfile: 更新用户资料
 * - useUploadAvatar: 上传头像
 * - useUpdateSettings: 更新用户设置
 * - useUserAction: 组合 hook，包含所有操作
 */

// Query Hooks
export {
  useUser, useUserById, useUserProfile, useUserSettings,
  userQueryKeys
} from './useUser';

// Mutation Hooks
export {
  useUpdateProfile, useUpdateSettings, useUploadAvatar, useUserAction
} from './useUserAction';

