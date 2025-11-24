import type { UserProfile, UserSettings } from '@/store/types';
import { client } from '../../client';
import type { ApiResponse, ListParams, PaginatedResponse } from '../../types';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  UploadAvatarResponse
} from './types';

/**
 * User API Endpoints
 * 用户相关的 API 接口
 */

// ============================================================================
// Auth Endpoints
// ============================================================================

/**
 * 登录
 */
export const login = async (credentials: LoginRequest) => {
  const response = await client.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data.data;
};

/**
 * 注册
 */
export const register = async (data: RegisterRequest) => {
  const response = await client.post<ApiResponse<LoginResponse>>('/auth/register', data);
  return response.data.data;
};

/**
 * 登出
 */
export const logout = async () => {
  const response = await client.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

/**
 * 刷新 Token
 */
export const refreshToken = async () => {
  const response = await client.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh');
  return response.data.data;
};

// ============================================================================
// User Profile Endpoints
// ============================================================================

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  const response = await client.get<ApiResponse<UserProfile>>('/user/profile');
  return response.data.data;
};

/**
 * 根据 ID 获取用户信息
 */
export const getUserById = async (userId: string) => {
  const response = await client.get<ApiResponse<UserProfile>>(`/user/${userId}`);
  return response.data.data;
};

/**
 * 更新用户信息
 */
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const response = await client.put<ApiResponse<UserProfile>>('/user/profile', updates);
  return response.data.data;
};

/**
 * 上传头像
 */
export const uploadAvatar = async (file: FormData) => {
  const response = await client.post<ApiResponse<UploadAvatarResponse>>('/user/avatar', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// ============================================================================
// User Settings Endpoints
// ============================================================================

/**
 * 获取用户设置
 */
export const getUserSettings = async () => {
  const response = await client.get<ApiResponse<UserSettings>>('/user/settings');
  return response.data.data;
};

/**
 * 更新用户设置
 */
export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const response = await client.put<ApiResponse<UserSettings>>('/user/settings', settings);
  return response.data.data;
};

// ============================================================================
// User List Endpoints (可选)
// ============================================================================

/**
 * 获取用户列表（搜索、分页）
 */
export const getUserList = async (params: ListParams = {}) => {
  const response = await client.get<ApiResponse<PaginatedResponse<UserProfile>>>('/user/list', {
    params,
  });
  return response.data.data;
};

/**
 * 搜索用户
 */
export const searchUsers = async (keyword: string) => {
  const response = await client.get<ApiResponse<UserProfile[]>>('/user/search', {
    params: { keyword },
  });
  return response.data.data;
};

// ============================================================================
// Export all as default object (可选的导出方式)
// ============================================================================

export const userApi = {
  // Auth
  login,
  register,
  logout,
  refreshToken,

  // Profile
  getCurrentUser,
  getUserById,
  updateUserProfile,
  uploadAvatar,

  // Settings
  getUserSettings,
  updateUserSettings,

  // List
  getUserList,
  searchUsers,
};
