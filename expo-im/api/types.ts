/**
 * API Common Types
 * 通用的 API 响应类型定义
 */

/**
 * 标准 API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 列表查询参数
 */
export interface ListParams extends PaginationParams {
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
