/**
 * React Query 缓存策略预设
 * 集中管理所有查询的缓存配置，避免配置分散难以维护
 */

/**
 * 缓存策略类型定义
 */
interface CachePreset {
  staleTime: number;
  gcTime: number;
}

/**
 * 时间常量（毫秒）
 */
const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

/**
 * 缓存策略预设
 *
 * 根据数据变化频率和重要性分类：
 * - realtime: 实时数据（聊天消息、通知等）
 * - frequent: 频繁变化的数据（动态、评论等）
 * - normal: 普通数据（用户资料等）
 * - static: 静态数据（配置、枚举等）
 * - infinite: 几乎不变的数据
 */
export const cachePresets = {
  /**
   * 实时数据 - 几乎不缓存
   * 适用：聊天消息、实时通知
   */
  realtime: {
    staleTime: 0,
    gcTime: 1 * MINUTES,
  },

  /**
   * 频繁更新数据
   * 适用：动态列表、评论、点赞数
   */
  frequent: {
    staleTime: 30 * SECONDS,
    gcTime: 2 * MINUTES,
  },

  /**
   * 普通数据（默认策略）
   * 适用：用户资料、帖子详情
   */
  normal: {
    staleTime: 5 * MINUTES,
    gcTime: 10 * MINUTES,
  },

  /**
   * 静态数据 - 长时间缓存
   * 适用：用户设置、应用配置
   */
  static: {
    staleTime: 10 * MINUTES,
    gcTime: 30 * MINUTES,
  },

  /**
   * 几乎不变的数据
   * 适用：国家列表、类目数据
   */
  infinite: {
    staleTime: 60 * MINUTES,
    gcTime: 24 * 60 * MINUTES, // 24小时
  },
} as const satisfies Record<string, CachePreset>;

/**
 * 获取缓存预设
 * @example
 * useQuery({
 *   queryKey: ['user'],
 *   queryFn: fetchUser,
 *   ...getCachePreset('normal'),
 * })
 */
export const getCachePreset = (preset: keyof typeof cachePresets): CachePreset => {
  return cachePresets[preset];
};

/**
 * 导出类型供外部使用
 */
export type CachePresetType = keyof typeof cachePresets;

