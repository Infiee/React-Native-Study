import { requireNativeView } from 'expo';
import * as React from 'react';
import { View } from 'react-native';

import { PullRefreshViewProps } from './PullRefresh.types';

// 导入原生视图 - 使用any类型避免类型问题
const NativeView: any = requireNativeView('PullRefresh');

/**
 * PullRefresh 下拉刷新组件
 * 
 * 跨平台原生下拉刷新和上拉加载体验：
 * - iOS: 使用 MJRefresh 库
 * - Android: 使用 SmartRefreshLayout 库
 * 
 * @example
 * ```tsx
 * <PullRefreshView
 *   refreshEnabled={true}
 *   loadMoreEnabled={true}
 *   onRefresh={handleRefresh}
 *   onLoadMore={handleLoadMore}
 * >
 *   <FlatList data={data} ... />
 * </PullRefreshView>
 * ```
 */
const PullRefreshView = React.forwardRef<View, PullRefreshViewProps>(
  (props, ref) => {
    const {
      children,
      style,
      refreshEnabled = true,
      loadMoreEnabled = true,
      refreshingText = '正在刷新...',
      loadMoreText = '加载更多...',
      onRefresh,
      onLoadMore,
      ...otherProps
    } = props;

    // 处理下拉刷新事件
    const handleRefresh = React.useCallback(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, [onRefresh]);

    // 处理上拉加载事件
    const handleLoadMore = React.useCallback(() => {
      if (onLoadMore) {
        onLoadMore();
      }
    }, [onLoadMore]);

    return (
      <NativeView
        ref={ref}
        style={style}
        refreshEnabled={refreshEnabled}
        loadMoreEnabled={loadMoreEnabled}
        refreshingText={refreshingText}
        loadMoreText={loadMoreText}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        {...otherProps}
      >
        {children}
      </NativeView>
    );
  }
);

PullRefreshView.displayName = 'PullRefreshView';

export default PullRefreshView;
