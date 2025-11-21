import ExpoModulesCore
import UIKit
import MJRefresh

// PullRefresh视图组件，集成MJRefresh功能
class PullRefreshView: ExpoView {
  // 事件分发器
  let onRefresh = EventDispatcher()
  let onLoadMore = EventDispatcher()
  
  // 刷新状态标记
  private var isRefreshing = false
  private var isLoadingMore = false
  
  // 防抖时间戳（添加防护机制）
  private var lastRefreshTime: TimeInterval = 0
  private var lastLoadMoreTime: TimeInterval = 0
  private let minTriggerInterval: TimeInterval = 0.3 // 300ms最小触发间隔
  
  // 用于追踪状态变化的key
  private var currentRefreshingKey: String = ""
  private var currentLoadingKey: String = ""
  private var currentNoMoreData: Bool = false
  
  // 存储配置，等待找到ScrollView后应用
  private var refreshEnabled = true
  private var loadMoreEnabled = true
  private var refreshingText = "正在刷新..."
  private var loadMoreText = "加载更多..."
  private var idlePullingText = "下拉刷新"
  private var releasePullingText = "释放立即刷新"
  private var idleLoadingText = "点击或上拉加载更多"
  private var releaseLoadingText = "释放立即加载"
  private var noMoreDataText = "没有更多数据了"
  
  // 找到的ScrollView引用
  private weak var targetScrollView: UIScrollView?
  
  // 是否已经设置过刷新控件
  private var hasSetupRefreshControls = false
  
  // 同步队列，保证线程安全
  private let syncQueue = DispatchQueue(label: "com.pullrefresh.sync")
  
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    // 不创建自己的ScrollView，等待子视图添加
  }
  
  // 递归查找第一个UIScrollView（优化：添加深度限制）
  private func findScrollView(in view: UIView, depth: Int = 0, maxDepth: Int = 10) -> UIScrollView? {
    // 防止过深的递归
    guard depth < maxDepth else { return nil }
    
    // 优先检查当前视图
    if let scrollView = view as? UIScrollView {
      return scrollView
    }
    
    // 广度优先搜索，先检查直接子视图
    for subview in view.subviews {
      if let scrollView = subview as? UIScrollView {
        return scrollView
      }
    }
    
    // 如果直接子视图中没有，再递归搜索
    for subview in view.subviews {
      if let scrollView = findScrollView(in: subview, depth: depth + 1, maxDepth: maxDepth) {
        return scrollView
      }
    }
    
    return nil
  }
  
  // 在找到的ScrollView上设置MJRefresh
  private func setupRefreshControls(on scrollView: UIScrollView) {
    // 防止重复设置
    guard !hasSetupRefreshControls else {
      print("⚠️ PullRefresh: 刷新控件已设置，跳过重复设置")
      return
    }
    
    // 移除可能存在的旧控件
    scrollView.mj_header = nil
    scrollView.mj_footer = nil
    
    // 设置下拉刷新
    let header = MJRefreshNormalHeader { [weak self] in
      guard let self = self else { return }
      
      // 防抖检查：防止短时间内重复触发
      let currentTime = Date().timeIntervalSince1970
      if currentTime - self.lastRefreshTime < self.minTriggerInterval {
        print("⚠️ PullRefresh: 刷新触发过快，忽略本次触发（距上次 \(Int((currentTime - self.lastRefreshTime) * 1000))ms）")
        DispatchQueue.main.async {
          self.targetScrollView?.mj_header?.endRefreshing()
        }
        return
      }
      
      DispatchQueue.main.async {
        // 状态检查：如果已经在刷新中，跳过
        var shouldTrigger = false
        self.syncQueue.sync {
          if !self.isRefreshing {
            self.isRefreshing = true
            self.lastRefreshTime = currentTime
            shouldTrigger = true
          }
        }
        
        if shouldTrigger {
          print("✅ PullRefresh: 触发下拉刷新")
          self.onRefresh([:])
        } else {
          print("⚠️ PullRefresh: 已在刷新中，忽略重复触发")
          self.targetScrollView?.mj_header?.endRefreshing()
        }
      }
    }
    header.lastUpdatedTimeLabel?.isHidden = true
    header.stateLabel?.textColor = .gray
    header.stateLabel?.font = .systemFont(ofSize: 14)
    
    // 设置不同状态的文字（使用配置的文字）
    header.setTitle(idlePullingText, for: .idle)           // 默认状态
    header.setTitle(releasePullingText, for: .pulling)     // 下拉中（超过触发距离）
    header.setTitle(refreshingText, for: .refreshing)      // 正在刷新
    header.setTitle("", for: .willRefresh)                 // 即将刷新
    header.setTitle("", for: .noMoreData)                  // 没有更多数据
    
    header.isHidden = !refreshEnabled
    scrollView.mj_header = header
    
    // 设置上拉加载
    let footer = MJRefreshAutoNormalFooter { [weak self] in
      guard let self = self else { return }
      
      // 防抖检查：防止短时间内重复触发
      let currentTime = Date().timeIntervalSince1970
      if currentTime - self.lastLoadMoreTime < self.minTriggerInterval {
        print("⚠️ PullRefresh: 加载触发过快，忽略本次触发（距上次 \(Int((currentTime - self.lastLoadMoreTime) * 1000))ms）")
        DispatchQueue.main.async {
          self.targetScrollView?.mj_footer?.endRefreshing()
        }
        return
      }
      
      DispatchQueue.main.async {
        // 状态检查：如果已经在加载中，跳过
        var shouldTrigger = false
        self.syncQueue.sync {
          if !self.isLoadingMore {
            self.isLoadingMore = true
            self.lastLoadMoreTime = currentTime
            shouldTrigger = true
          }
        }
        
        if shouldTrigger {
          print("✅ PullRefresh: 触发上拉加载")
          self.onLoadMore([:])
        } else {
          print("⚠️ PullRefresh: 已在加载中，忽略重复触发")
          self.targetScrollView?.mj_footer?.endRefreshing()
        }
      }
    }
    footer.stateLabel?.textColor = .gray
    footer.stateLabel?.font = .systemFont(ofSize: 14)
    
    // 设置不同状态的文字（使用配置的文字）
    footer.setTitle(idleLoadingText, for: .idle)          // 默认状态
    footer.setTitle(releaseLoadingText, for: .pulling)    // 上拉中
    footer.setTitle(loadMoreText, for: .refreshing)       // 正在加载
    footer.setTitle("", for: .willRefresh)                // 即将加载
    footer.setTitle(noMoreDataText, for: .noMoreData)     // 没有更多数据
    
    footer.isHidden = !loadMoreEnabled
    scrollView.mj_footer = footer
    
    hasSetupRefreshControls = true
    print("✅ PullRefresh: 刷新控件设置成功")
  }
  
  // 结束刷新（线程安全）
  func endRefresh() {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.syncQueue.async {
        guard self.isRefreshing else { return }
        self.isRefreshing = false
      }
      self.targetScrollView?.mj_header?.endRefreshing()
    }
  }
  
  // 结束加载更多（线程安全）
  func endLoadMore() {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.syncQueue.async {
        guard self.isLoadingMore else { return }
        self.isLoadingMore = false
      }
      self.targetScrollView?.mj_footer?.endRefreshing()
    }
  }
  
  // 没有更多数据（线程安全）
  func noMoreData() {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.syncQueue.async {
        self.isLoadingMore = false
      }
      self.targetScrollView?.mj_footer?.endRefreshingWithNoMoreData()
    }
  }
  
  // 重置没有更多数据状态（线程安全）
  func resetNoMoreData() {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.targetScrollView?.mj_footer?.resetNoMoreData()
    }
  }
  
  // 启用/禁用下拉刷新
  func setRefreshEnabled(_ enabled: Bool) {
    refreshEnabled = enabled
    DispatchQueue.main.async { [weak self] in
      self?.targetScrollView?.mj_header?.isHidden = !enabled
    }
  }
  
  // 启用/禁用上拉加载
  func setLoadMoreEnabled(_ enabled: Bool) {
    loadMoreEnabled = enabled
    DispatchQueue.main.async { [weak self] in
      self?.targetScrollView?.mj_footer?.isHidden = !enabled
    }
  }
  
  // 设置刷新文字
  func setRefreshingText(_ text: String) {
    refreshingText = text
    DispatchQueue.main.async { [weak self] in
      if let header = self?.targetScrollView?.mj_header as? MJRefreshNormalHeader {
        // 只更新正在刷新状态的文字
        header.setTitle(text, for: .refreshing)
      }
    }
  }
  
  // 设置加载更多文字
  func setLoadMoreText(_ text: String) {
    loadMoreText = text
    DispatchQueue.main.async { [weak self] in
      if let footer = self?.targetScrollView?.mj_footer as? MJRefreshAutoNormalFooter {
        // 只更新正在加载状态的文字
        footer.setTitle(text, for: .refreshing)
      }
    }
  }
  
  // 通过key控制刷新状态
  func setRefreshingKey(_ key: String) {
    if key != currentRefreshingKey && !key.isEmpty {
      currentRefreshingKey = key
      endRefresh()
    }
  }
  
  // 通过key控制加载状态
  func setLoadingKey(_ key: String) {
    if key != currentLoadingKey && !key.isEmpty {
      currentLoadingKey = key
      endLoadMore()
    }
  }
  
  // 设置没有更多数据状态
  func setNoMoreDataFlag(_ flag: Bool) {
    if flag != currentNoMoreData {
      currentNoMoreData = flag
      if flag {
        noMoreData()
      } else {
        resetNoMoreData()
      }
    }
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    // 优化：只在需要时调整子视图大小
    if bounds.size != .zero {
      for subview in subviews where subview.frame.size != bounds.size {
        subview.frame = bounds
      }
    }
  }
  
  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)
    addSubview(subview)
    
    // 设置子视图frame
    subview.frame = bounds
    subview.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    
    // 优化：使用 DispatchQueue.main.async 而非延迟，更可靠
    DispatchQueue.main.async { [weak self] in
      self?.trySetupScrollView()
    }
  }
  
  override func removeReactSubview(_ subview: UIView!) {
    super.removeReactSubview(subview)
    
    // 修复：检查 targetScrollView 是否是被移除视图的子孙
    if let scrollView = targetScrollView {
      // 递归检查 scrollView 是否在 subview 的子树中
      if isView(scrollView, descendantOf: subview) {
        targetScrollView = nil
        hasSetupRefreshControls = false
        print("⚠️ PullRefresh: ScrollView 已被移除，清除引用")
      }
    }
    
    subview.removeFromSuperview()
  }
  
  // 辅助方法：检查一个视图是否是另一个视图的子孙
  private func isView(_ view: UIView, descendantOf parentView: UIView) -> Bool {
    var currentView: UIView? = view
    while let current = currentView {
      if current == parentView {
        return true
      }
      currentView = current.superview
    }
    return false
  }
  
  // 尝试查找并设置ScrollView（优化版本）
  private func trySetupScrollView() {
    // 如果已经找到并设置过了，检查是否还有效
    if let existingScrollView = targetScrollView {
      // 检查 ScrollView 是否还在视图树中
      if existingScrollView.superview == nil {
        print("⚠️ PullRefresh: 检测到 ScrollView 已从视图树移除")
        targetScrollView = nil
        hasSetupRefreshControls = false
      } else {
        // ScrollView 仍然有效，不需要重新设置
        return
      }
    }
    
    // 在子视图中查找ScrollView
    for subview in subviews {
      if let scrollView = findScrollView(in: subview) {
        targetScrollView = scrollView
        setupRefreshControls(on: scrollView)
        print("✅ PullRefresh: 找到 ScrollView 类型: \(type(of: scrollView))")
        return
      }
    }
    
    // 如果还是没找到，延迟重试一次（React Native 视图树可能还在构建中）
    if targetScrollView == nil {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
        guard let self = self, self.targetScrollView == nil else { return }
        
        for subview in self.subviews {
          if let scrollView = self.findScrollView(in: subview) {
            self.targetScrollView = scrollView
            self.setupRefreshControls(on: scrollView)
            print("✅ PullRefresh: 延迟查找成功，找到 ScrollView")
            return
          }
        }
        
        print("⚠️ PullRefresh: 未找到 ScrollView，请确保子组件包含可滚动视图（ScrollView/FlatList等）")
      }
    }
  }
  
  // 当视图添加到窗口时，再次尝试查找ScrollView
  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      trySetupScrollView()
    }
  }
  
  // 清理资源
  deinit {
    // 移除 MJRefresh 控件
    targetScrollView?.mj_header = nil
    targetScrollView?.mj_footer = nil
    print("🔄 PullRefresh: 视图已销毁，清理资源")
  }
}
