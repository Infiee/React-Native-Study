# Expo Demo 项目

这是一个使用 Expo 框架构建的 React Native 项目，展示了多种原生功能的集成和使用方式。

## 功能模块

### PullRefresh 下拉刷新和上拉加载组件

本项目集成了一个自定义的 PullRefresh 组件，支持下拉刷新和上拉加载更多功能，并且在 Android 端支持 Lottie 动画效果。

#### 功能特点

- ✅ 跨平台支持 (iOS & Android)
- ✅ 下拉刷新和上拉加载双功能
- ✅ Android 端支持 Lottie 动画头部
- ✅ 灵活的状态控制方式 (Ref 或 Key)
- ✅ 可自定义提示文字
- ✅ 支持"没有更多数据"状态显示

#### 安装与使用

该组件已经内置于项目中，位于 `modules/pull-refresh` 目录下，可以直接导入使用：

```typescript
import PullRefresh from '@/modules/pull-refresh';
```

#### 基本用法

##### 方法一：使用 Ref 控制（推荐）

```typescript
import React, { useRef, useState } from 'react';
import PullRefresh, { PullRefreshRef } from '@/modules/pull-refresh';

function MyComponent() {
  const pullRefreshRef = useRef<PullRefreshRef>(null);
  const [data, setData] = useState([]);

  const handleRefresh = async () => {
    try {
      // 执行刷新逻辑
      const newData = await fetchData();
      setData(newData);
    } finally {
      // 结束刷新状态
      pullRefreshRef.current?.endRefresh();
    }
  };

  const handleLoadMore = async () => {
    try {
      // 执行加载更多逻辑
      const moreData = await fetchMoreData();
      setData(prev => [...prev, ...moreData]);
    } finally {
      // 结束加载状态
      pullRefreshRef.current?.endLoadMore();
    }
  };

  return (
    <PullRefresh
      ref={pullRefreshRef}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
    >
      {/* 你的内容 */}
    </PullRefresh>
  );
}
```

##### 方法二：使用 Key 控制

```typescript
import React, { useState } from 'react';
import PullRefresh from '@/modules/pull-refresh';

function MyComponent() {
  const [data, setData] = useState([]);
  const [refreshingKey, setRefreshingKey] = useState('');
  const [loadingKey, setLoadingKey] = useState('');

  const handleRefresh = async () => {
    try {
      // 执行刷新逻辑
      const newData = await fetchData();
      setData(newData);
    } finally {
      // 结束刷新状态
      setRefreshingKey(Date.now().toString());
    }
  };

  const handleLoadMore = async () => {
    try {
      // 执行加载更多逻辑
      const moreData = await fetchMoreData();
      setData(prev => [...prev, ...moreData]);
    } finally {
      // 结束加载状态
      setLoadingKey(Date.now().toString());
    }
  };

  return (
    <PullRefresh
      refreshingKey={refreshingKey}
      loadingKey={loadingKey}
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
    >
      {/* 你的内容 */}
    </PullRefresh>
  );
}
```

#### Props 参数

| 属性名 | 类型 | 默认值 | 描述 |
|-------|------|--------|------|
| refreshEnabled | boolean | true | 是否启用下拉刷新功能 |
| loadMoreEnabled | boolean | true | 是否启用上拉加载功能 |
| refreshingText | string | "正在刷新..." | 下拉刷新时的提示文字 |
| loadMoreText | string | "加载更多..." | 上拉加载时的提示文字 |
| onRefresh | function | - | 下拉刷新触发的回调函数 |
| onLoadMore | function | - | 上拉加载触发的回调函数 |
| refreshingKey | string/number | - | 控制刷新状态的 key，改变时结束刷新 |
| loadingKey | string/number | - | 控制加载状态的 key，改变时结束加载 |
| noMoreData | boolean | false | 是否显示"没有更多数据" |

#### Ref 控制方法

当使用 Ref 方式控制时，可以通过以下方法精确控制组件状态：

- `endRefresh()` - 结束下拉刷新状态
- `endLoadMore()` - 结束上拉加载状态
- `noMoreData()` - 设置为没有更多数据状态
- `resetNoMoreData()` - 重置没有更多数据状态

#### 平台差异

- **iOS**: 使用 MJRefresh 库实现，提供原生的下拉刷新体验
- **Android**: 使用 SmartRefreshLayout 库实现，并支持 Lottie 动画作为刷新头部

在 Android 端，Lottie 动画文件位于 `modules/pull-refresh/android/src/main/assets/pull_refresh_lottie.json`，你可以替换此文件来自定义刷新动画效果。

#### 注意事项

1. 请确保内容组件支持滚动，例如 ScrollView、FlatList 等
2. 如果需要禁用某个功能，可以将对应的 Enabled 属性设为 false
3. 在没有更多数据时，调用 `noMoreData()` 方法显示相应提示
4. 务必在操作完成后调用相应的结束方法，避免组件处于持续加载状态

#### 示例

更多使用示例请参考 `modules/pull-refresh/example/PullRefreshExample.tsx` 文件。