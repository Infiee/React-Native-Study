import { BREAKPOINTS, scaleModerate } from '@/utils/scaling';
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export type BreakpointKey = keyof typeof BREAKPOINTS;

type ResponsiveConfig<T> = Partial<Record<BreakpointKey, T>>;

export function useAppResponsive() {
  const { width, fontScale } = useWindowDimensions();

  // --- 1. 宏观断点逻辑 ---
  const breakpoint = useMemo(() => {
    const keys = (Object.keys(BREAKPOINTS).reverse() as BreakpointKey[]);
    return keys.find(key => width >= BREAKPOINTS[key]) || 'sm';
  }, [width]);

  // Mobile First 策略选择器
  const select = <T>(config: ResponsiveConfig<T>): T | undefined => {
    const keys: BreakpointKey[] = ['sm', 'md', 'lg', 'xl'];
    let result: T | undefined;
    for (const key of keys) {
      if (config[key] !== undefined) result = config[key];
      if (key === breakpoint) break;
    }
    return result;
  };

  // --- 2. 微观自适应逻辑 ---

  /**
   * 智能尺寸缩放 (Responsive Size)
   * 逻辑：
   * - 手机模式 (sm): 使用适度缩放 (保证小屏和大屏手机都有良好体验)
   * - 平板/桌面 (md+): 通常不再继续放大，而是保持固定或微调，防止按钮变得巨大
   */
  const rs = (size: number) => {
    if (width >= BREAKPOINTS.md) {
      // 平板以上，通常不需要按手机比例无限放大
      // 策略A: 保持 1.2 倍或者固定值
      return size * 1.2;
      // 策略B: 继续缩放，但 factor 很小
      // return scaleModerate(size, 0.2);
    }
    // 手机模式：使用适度缩放
    return scaleModerate(size);
  };

  /**
   * 字体缩放 (Responsive Font)
   * 考虑了系统的 fontScale (用户设置的大号字体)
   */
  const rf = (size: number) => {
    const newSize = rs(size); // 先按屏幕算基准
    return newSize / fontScale; // 抵消部分系统缩放，或根据需求 * fontScale
    // 注意：React Native Text 默认会自动乘 fontScale，
    // 如果你想完全控制，可以用 PixelRatio.roundToNearestPixel
  };

  return {
    breakpoint,
    width,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,

    select, // 宏观：选值
    rs,     // 微观：尺寸 (margin, padding, width, height)
    rf,     // 微观：字体 (fontSize)
  };
}
