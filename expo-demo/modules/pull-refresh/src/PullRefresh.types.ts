import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

// 下拉刷新事件回调
export type OnRefreshEventPayload = {
  // 可以添加额外的事件数据
};

// 上拉加载事件回调
export type OnLoadMoreEventPayload = {
  // 可以添加额外的事件数据
};

// PullRefresh视图组件的Props
export type PullRefreshViewProps = {
  // 子组件
  children?: ReactNode;
  
  // 样式
  style?: StyleProp<ViewStyle>;
  
  // 是否启用下拉刷新，默认true
  refreshEnabled?: boolean;
  
  // 是否启用上拉加载，默认true
  loadMoreEnabled?: boolean;
  
  // 下拉刷新的文字提示
  refreshingText?: string;
  
  // 上拉加载的文字提示
  loadMoreText?: string;
  
  // 下拉刷新回调
  onRefresh?: () => void;
  
  // 上拉加载回调
  onLoadMore?: () => void;
  
  // 控制刷新状态的ID，每次改变会触发刷新结束
  refreshingKey?: string | number;
  
  // 控制加载状态的ID，每次改变会触发加载结束
  loadingKey?: string | number;
  
  // 是否显示"没有更多数据"
  noMoreData?: boolean;
};
