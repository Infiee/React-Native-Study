import * as React from 'react';
import { PullRefreshViewProps } from './PullRefresh.types';
import PullRefreshView from './PullRefreshView';

// Ref控制方法接口
export interface PullRefreshRef {
  // 结束下拉刷新
  endRefresh: () => void;
  // 结束上拉加载
  endLoadMore: () => void;
  // 设置没有更多数据
  noMoreData: () => void;
  // 重置没有更多数据状态
  resetNoMoreData: () => void;
}

/**
 * 带Ref控制的PullRefresh组件
 * 
 * 使用forwardRef支持通过ref调用控制方法
 * 
 * @example
 * ```tsx
 * const pullRefreshRef = useRef<PullRefreshRef>(null);
 * 
 * const handleRefresh = async () => {
 *   await fetchData();
 *   pullRefreshRef.current?.endRefresh();
 * };
 * 
 * <PullRefresh
 *   ref={pullRefreshRef}
 *   onRefresh={handleRefresh}
 * >
 *   <YourContent />
 * </PullRefresh>
 * ```
 */
const PullRefresh = React.forwardRef<PullRefreshRef, PullRefreshViewProps>(
  (props, ref) => {
    // 使用状态来触发刷新结束
    const [refreshingKey, setRefreshingKey] = React.useState('');
    const [loadingKey, setLoadingKey] = React.useState('');
    const [hasNoMoreData, setHasNoMoreData] = React.useState(false);

    // 暴露控制方法给外部
    React.useImperativeHandle(ref, () => ({
      endRefresh: () => {
        // 改变key来触发刷新结束
        setRefreshingKey(Date.now().toString());
      },
      endLoadMore: () => {
        // 改变key来触发加载结束
        setLoadingKey(Date.now().toString());
      },
      noMoreData: () => {
        setHasNoMoreData(true);
        setLoadingKey(Date.now().toString());
      },
      resetNoMoreData: () => {
        setHasNoMoreData(false);
      },
    }));

    return (
      <PullRefreshView 
        {...props}
        refreshingKey={refreshingKey}
        loadingKey={loadingKey}
        noMoreData={hasNoMoreData}
      />
    );
  }
);

PullRefresh.displayName = 'PullRefresh';

export default PullRefresh;

