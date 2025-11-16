import PullRefresh, { PullRefreshRef } from '@/modules/pull-refresh';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ListRenderItem, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DataItem {
  id: number;
  title: string;
  subtitle: string;
}

export default function PullRefreshDemo() {
  const pullRefreshRef = useRef<PullRefreshRef>(null);
  const [data, setData] = useState<DataItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 初次加载数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 初始加载
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const newData = await mockFetchData(1);
      setData(newData);
      setPage(1);
      setHasMore(true);
    } catch (error) {
      console.error('初始加载失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 模拟API请求
  const mockFetchData = async (pageNum: number): Promise<DataItem[]> => {
    // 模拟网络延迟
    const start = Date.now();
    console.log(`[${new Date().toLocaleTimeString()}] 模拟网络延迟...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
    const end = Date.now();
    console.log(`[${new Date().toLocaleTimeString()}] 模拟网络延迟结束，耗时${end - start}ms`);

    const newData: DataItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: (pageNum - 1) * 10 + i + 1,
      title: `数据项 ${(pageNum - 1) * 10 + i + 1}`,
      subtitle: `这是第 ${pageNum} 页的第 ${i + 1} 条数据`,
    }));

    return newData;
  };

  // 下拉刷新
  const handleRefresh = async () => {
    // 防止重复加载
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      console.log('开始刷新...');
      const newData = await mockFetchData(1);
      setData(newData);
      setPage(1);
      setHasMore(true);
      
      // 重置没有更多数据状态
      pullRefreshRef.current?.resetNoMoreData();
      console.log('刷新完成');
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsLoading(false);
      // 结束刷新动画
      pullRefreshRef.current?.endRefresh();
    }
  };

  // 上拉加载更多
  const handleLoadMore = async () => {
    // 防止重复加载
    if (isLoading || !hasMore) {
      console.log('加载中或没有更多数据');
      return;
    }

    try {
      setIsLoading(true);
      console.log('开始加载更多...');
      const nextPage = page + 1;
      const newData = await mockFetchData(nextPage);
      
      if (nextPage >= 5) {
        // 模拟：第5页后没有更多数据
        console.log('已加载全部数据');
        setHasMore(false);
        pullRefreshRef.current?.noMoreData();
      } else {
        setData([...data, ...newData]);
        setPage(nextPage);
        console.log(`加载完成，当前第 ${nextPage} 页`);
        pullRefreshRef.current?.endLoadMore();
      }
    } catch (error) {
      console.error('加载更多失败:', error);
      pullRefreshRef.current?.endLoadMore();
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染列表项
  const renderItem: ListRenderItem<DataItem> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>#{item.id}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>
          {new Date().toLocaleTimeString('zh-CN')}
        </Text>
      </View>
    </View>
  );

  // 列表头部组件
  const ListHeaderComponent = () => (
    <>
      {/* 统计信息 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.length}</Text>
          <Text style={styles.statLabel}>数据总数</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{page}</Text>
          <Text style={styles.statLabel}>当前页数</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{hasMore ? '是' : '否'}</Text>
          <Text style={styles.statLabel}>还有更多</Text>
        </View>
      </View>

      {/* 提示卡片 */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>使用提示</Text>
          <Text style={styles.tipText}>
            向下拉动刷新数据{'\n'}
            滚动到底部自动加载更多{'\n'}
            加载到第5页后将显示"没有更多数据"
          </Text>
        </View>
      </View>
    </>
  );

  // 空列表组件
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyText}>暂无数据</Text>
      <Text style={styles.emptySubtext}>下拉刷新加载数据</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PullRefresh 示例</Text>
        <Text style={styles.headerSubtitle}>下拉刷新 • 上拉加载</Text>
      </View>

      {/* 下拉刷新组件 */}
      <PullRefresh
        ref={pullRefreshRef}
        style={styles.container}
        refreshEnabled={true}
        loadMoreEnabled={true}
        refreshingText="正在刷新..."
        loadMoreText="加载更多..."
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
      >
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.flatListContent}
          // 性能优化
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
          initialNumToRender={10}
        />
      </PullRefresh>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  container: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  divider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginHorizontal: 8,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0056b3',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#004085',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  cardFooterText: {
    fontSize: 12,
    color: '#adb5bd',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
  },
});

