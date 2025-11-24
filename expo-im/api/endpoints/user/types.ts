import type { UserProfile } from '@/store/types';

/**
 * User API specific types
 * 用户 API 专用类型定义
 */

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string;
  user: UserProfile;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Token 刷新响应
 */
export interface RefreshTokenResponse {
  token: string;
}

/**
 * 头像上传响应
 */
export interface UploadAvatarResponse {
  url: string;
}
