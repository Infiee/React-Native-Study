package expo.modules.pullrefresh

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * PullRefresh 模块定义
 * 
 * 功能对标 iOS 版本：
 * - 提供下拉刷新和上拉加载功能
 * - 通过 Props 控制状态
 * - 通过 Events 发送事件
 * - 使用 SmartRefreshLayout 库实现
 */
class PullRefreshModule : Module() {
    
    override fun definition() = ModuleDefinition {
        // 模块名称
        Name("PullRefresh")
        
        // 定义视图组件
        View(PullRefreshView::class) {
            // 事件定义
            Events("onRefresh", "onLoadMore")
            
            // Props定义 - 功能控制
            Prop("refreshEnabled") { view: PullRefreshView, enabled: Boolean ->
                view.setRefreshEnabled(enabled)
            }
            
            Prop("loadMoreEnabled") { view: PullRefreshView, enabled: Boolean ->
                view.setLoadMoreEnabled(enabled)
            }
            
            // Props定义 - 文字设置
            Prop("refreshingText") { view: PullRefreshView, text: String ->
                view.setRefreshingText(text)
            }
            
            Prop("loadMoreText") { view: PullRefreshView, text: String ->
                view.setLoadMoreText(text)
            }
            
            // Props定义 - 状态控制
            Prop("refreshingKey") { view: PullRefreshView, key: String ->
                view.setRefreshingKey(key)
            }
            
            Prop("loadingKey") { view: PullRefreshView, key: String ->
                view.setLoadingKey(key)
            }
            
            Prop("noMoreData") { view: PullRefreshView, flag: Boolean ->
                view.setNoMoreDataFlag(flag)
            }
            
            // 设置事件回调
            OnViewDidUpdateProps { view: PullRefreshView ->
                // 当Props更新时，可以在这里做额外处理
            }
        }
    }
}

/*
 优化说明：
 
 1. 与iOS版本API完全一致
    - 相同的Props命名和类型
    - 相同的Events命名
    - 相同的控制机制（key机制）
 
 2. 使用声明式控制
    - refreshingKey: 每次变化时自动调用 endRefresh()
    - loadingKey: 每次变化时自动调用 endLoadMore()
    - noMoreData: 布尔值控制"没有更多数据"状态
 
 3. 核心特性
    - 自动查找可滚动视图（RecyclerView、ScrollView、ListView等）
    - 支持 key 机制控制状态
    - 线程安全（所有 UI 操作在主线程）
    - 防止重复设置
    - 资源自动清理
 
 4. 使用方式与 iOS 完全一致
    ```typescript
    <PullRefresh
      ref={ref}
      refreshEnabled={true}
      loadMoreEnabled={true}
      refreshingText="正在刷新..."
      loadMoreText="加载更多..."
      onRefresh={handleRefresh}
      onLoadMore={handleLoadMore}
    >
      <FlatList data={data} ... />
    </PullRefresh>
    ```
 
 5. SmartRefreshLayout vs MJRefresh
    - SmartRefreshLayout: Android平台强大的下拉刷新库
    - MJRefresh: iOS平台经典的下拉刷新库
    - 两者功能对等，API设计保持一致
 */
