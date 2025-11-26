import { Dimensions } from 'react-native';

// 1. 设计稿基准 (例如设计师按 iPhone 6/7/8 的 375 宽出的图)
const GUIDELINE_BASE_WIDTH = 375;

// 2. 断点定义
export const BREAKPOINTS = {
  sm: 0,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// 3. 基础缩放计算工具 (不仅在 Hook 里用，有时静态样式也需要)
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 线性缩放：完全按照屏幕宽度比例缩放
 * 适合：宽度的微调、大图容器
 */
export const scaleLinear = (size: number) => {
  return (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * 适度缩放：在 resize 和原值之间取平衡
 * factor 默认 0.5。0 = 不缩放，1 = 线性缩放。
 * 适合：字体、间距 (避免在大屏手机上变得过大)
 */
export const scaleModerate = (size: number, factor = 0.5) => {
  return size + (scaleLinear(size) - size) * factor;
};
