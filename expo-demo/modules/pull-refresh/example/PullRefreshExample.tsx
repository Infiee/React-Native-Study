/**
 * PullRefresh 使用示例
 * 
 * 展示如何在 React Native 项目中使用下拉刷新组件
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import PullRefresh from '../src/PullRefreshComponent';
import { PullRefreshRef } from '../src/PullRefreshComponent';

// 模拟数据项
interface DataItem {
  id: string;
  title: string;
  subtitle: string;
}

// 模拟API请求
const mockFetchData = async (page: number = 1): Promise<DataItem[]> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const pageSize = 10;
  const startIndex = (page - 1) * pageSize;
  
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `item-${startIndex + i + 1}`,
    title: `标题 ${startIndex + i + 1}`,
    subtitle: `这是第 ${startIndex + i + 1} 项的描述信息`,
  }));
};

/**
 * 示例1: 使用 Ref 控制
 */
export function PullRefreshRefExample() {
  const [data, setData] = useState<DataItem[]>([]);
  const [page, setPage] = useState(1);
  const pullRefreshRef = useRef<PullRefreshRef>(null);

  // 下拉刷新
  const handleRefresh = async () => {
    try {
      console.log('开始刷新...');
      const newData = await mockFetchData(1);
      setData(newData);
      setPage(1);
      console.log('刷新成功');
      
      // 重置"没有更多数据"状态
      pullRefreshRef.current?.resetNoMoreData();
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      // 结束刷新
      pullRefreshRef.current?.endRefresh();
    }
  };

  // 上拉加载更多
  const handleLoadMore = async () => {
    try {
      console.log('开始加载更多...');
      const nextPage = page + 1;
      const moreData = await mockFetchData(nextPage);
      
      if (moreData.length === 0) {
        // 没有更多数据
        console.log('没有更多数据');
        pullRefreshRef.current?.noMoreData();
      } else {
        setData([...data, ...moreData]);
        setPage(nextPage);
        console.log('加载成功');
        pullRefreshRef.current?.endLoadMore();
      }
    } catch (error) {
      console.error('加载失败:', error);
      pullRefreshRef.current?.endLoadMore();
    }
  };

  // 渲染列表项
  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ref 控制示例</Text>
      </View>
      
      <PullRefresh
        ref={pullRefreshRef}
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
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>下拉刷新加载数据</Text>
            </View>
          }
        />
      </PullRefresh>
    </SafeAreaView>
  );
}

/**
 * 示例2: 使用 Key 控制（推荐）
 */
export function PullRefreshKeyExample() {
  const [data, setData] = useState<DataItem[]>([]);
  const [page, setPage] = useState(1);
  const [refreshingKey, setRefreshingKey] = useState('');
  const [loadingKey, setLoadingKey] = useState('');
  const [noMoreData, setNoMoreData] = useState(false);

  // 下拉刷新
  const handleRefresh = async () => {
    try {
      console.log('开始刷新...');
      const newData = await mockFetchData(1);
      setData(newData);
      setPage(1);
      setNoMoreData(false);
      console.log('刷新成功');
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      // 改变 key 结束刷新
      setRefreshingKey(Date.now().toString());
    }
  };

  // 上拉加载更多
  const handleLoadMore = async () => {
    try {
      console.log('开始加载更多...');
      const nextPage = page + 1;
      const moreData = await mockFetchData(nextPage);
      
      if (moreData.length === 0) {
        // 没有更多数据
        console.log('没有更多数据');
        setNoMoreData(true);
      } else {
        setData([...data, ...moreData]);
        setPage(nextPage);
        console.log('加载成功');
      }
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      // 改变 key 结束加载
      setLoadingKey(Date.now().toString());
    }
  };

  // 渲染列表项
  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Key 控制示例（推荐）</Text>
      </View>
      
      <PullRefresh
        refreshEnabled={true}
        loadMoreEnabled={true}
        refreshingText="正在刷新..."
        loadMoreText="加载更多..."
        refreshingKey={refreshingKey}
        loadingKey={loadingKey}
        noMoreData={noMoreData}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
      >
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>下拉刷新加载数据</Text>
            </View>
          }
        />
      </PullRefresh>
    </SafeAreaView>
  );
}

/**
 * 示例3: 自定义配置
 */
export function PullRefreshCustomExample() {
  const [data, setData] = useState<DataItem[]>([]);
  const [refreshEnabled, setRefreshEnabled] = useState(true);
  const [loadMoreEnabled, setLoadMoreEnabled] = useState(true);
  const pullRefreshRef = useRef<PullRefreshRef>(null);

  const handleRefresh = async () => {
    const newData = await mockFetchData(1);
    setData(newData);
    pullRefreshRef.current?.endRefresh();
    pullRefreshRef.current?.resetNoMoreData();
  };

  const handleLoadMore = async () => {
    const moreData = await mockFetchData(2);
    if (moreData.length === 0) {
      pullRefreshRef.current?.noMoreData();
    } else {
      setData([...data, ...moreData]);
      pullRefreshRef.current?.endLoadMore();
    }
  };

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>自定义配置示例</Text>
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, refreshEnabled && styles.buttonActive]}
            onPress={() => setRefreshEnabled(!refreshEnabled)}
          >
            <Text style={styles.buttonText}>
              下拉刷新: {refreshEnabled ? '开' : '关'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, loadMoreEnabled && styles.buttonActive]}
            onPress={() => setLoadMoreEnabled(!loadMoreEnabled)}
          >
            <Text style={styles.buttonText}>
              上拉加载: {loadMoreEnabled ? '开' : '关'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <PullRefresh
        ref={pullRefreshRef}
        refreshEnabled={refreshEnabled}
        loadMoreEnabled={loadMoreEnabled}
        refreshingText="🔄 正在刷新数据..."
        loadMoreText="📦 正在加载更多..."
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
      >
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {refreshEnabled ? '下拉刷新加载数据' : '下拉刷新已禁用'}
              </Text>
            </View>
          }
        />
      </PullRefresh>
    </SafeAreaView>
  );
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

// 导出默认示例
export default PullRefreshKeyExample;

