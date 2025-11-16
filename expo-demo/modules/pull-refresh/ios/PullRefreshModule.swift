import ExpoModulesCore
import MJRefresh

public class PullRefreshModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PullRefresh")

    // 定义视图组件
    View(PullRefreshView.self) {
      // 事件定义
      Events("onRefresh", "onLoadMore")
      
      // Props定义 - 功能控制
      Prop("refreshEnabled") { (view: PullRefreshView, enabled: Bool) in
        view.setRefreshEnabled(enabled)
      }
      
      Prop("loadMoreEnabled") { (view: PullRefreshView, enabled: Bool) in
        view.setLoadMoreEnabled(enabled)
      }
      
      // Props定义 - 文字设置
      Prop("refreshingText") { (view: PullRefreshView, text: String) in
        view.setRefreshingText(text)
      }
      
      Prop("loadMoreText") { (view: PullRefreshView, text: String) in
        view.setLoadMoreText(text)
      }
      
      // Props定义 - 状态控制
      Prop("refreshingKey") { (view: PullRefreshView, key: String) in
        view.setRefreshingKey(key)
      }
      
      Prop("loadingKey") { (view: PullRefreshView, key: String) in
        view.setLoadingKey(key)
      }
      
      Prop("noMoreData") { (view: PullRefreshView, flag: Bool) in
        view.setNoMoreDataFlag(flag)
      }
      
      // 注意：不需要暴露 endRefresh 等方法给 JS
      // 已通过 Props 的 key 机制（refreshingKey、loadingKey）来控制刷新状态
      // 这种方式更符合 React 的声明式编程理念，且避免了复杂的方法调用
    }
  }
}

/*
 优化说明：
 
 1. 移除了不必要的 Function 定义
    - endRefresh、endLoadMore、noMoreData、resetNoMoreData
    - 这些方法通过 Props 的 key 变化来触发，更加可靠
 
 2. 使用声明式控制
    - refreshingKey: 每次变化时自动调用 endRefresh()
    - loadingKey: 每次变化时自动调用 endLoadMore()
    - noMoreData: 布尔值控制"没有更多数据"状态
 
 3. 优势
    - 避免了跨语言边界的方法调用
    - 更符合 React 的编程范式
    - 自动处理线程安全
    - 减少了 API 复杂度
 */
