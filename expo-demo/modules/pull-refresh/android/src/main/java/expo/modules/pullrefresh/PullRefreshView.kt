package expo.modules.pullrefresh

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.NestedScrollView
import androidx.recyclerview.widget.RecyclerView
import com.scwang.smart.refresh.layout.SmartRefreshLayout
import com.scwang.smart.refresh.layout.api.RefreshLayout
import com.scwang.smart.refresh.layout.constant.SpinnerStyle
import com.scwang.smart.refresh.layout.listener.OnLoadMoreListener
import com.scwang.smart.refresh.layout.listener.OnRefreshListener
import com.scwang.smart.refresh.footer.BallPulseFooter
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

/**
 * PullRefresh视图组件，集成SmartRefreshLayout功能
 * 
 * 功能对标iOS版本：
 * - 自动查找可滚动视图（ScrollView、RecyclerView等）
 * - 支持下拉刷新和上拉加载
 * - 通过Props控制状态
 * - 通过Events发送事件
 * - 线程安全
 */
class PullRefreshView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    
    // SmartRefreshLayout实例
    private var refreshLayout: SmartRefreshLayout? = null
    
    // 刷新状态标记
    private var isRefreshing = false
    private var isLoadingMore = false
    
    // 用于追踪状态变化的key
    private var currentRefreshingKey: String = ""
    private var currentLoadingKey: String = ""
    private var currentNoMoreData: Boolean = false
    
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
    
    // 是否已经设置过刷新控件
    private var hasSetupRefreshControls = false
    
    // 主线程Handler
    private val mainHandler = Handler(Looper.getMainLooper())
    
    // 事件分发器
    private val onRefresh by EventDispatcher()
    private val onLoadMore by EventDispatcher()
    
    init {
        // 初始化时不创建SmartRefreshLayout，等待子视图添加
    }
    
    /**
     * 递归查找第一个可滚动视图（RecyclerView、ScrollView、NestedScrollView等）
     * 使用广度优先搜索算法，添加深度限制
     */
    private fun findScrollView(view: View, depth: Int = 0, maxDepth: Int = 10): View? {
        // 防止过深的递归
        if (depth >= maxDepth) return null
        
        // 检查当前视图是否是可滚动视图
        if (isScrollableView(view)) {
            return view
        }
        
        // 如果是ViewGroup，先检查直接子视图（广度优先）
        if (view is ViewGroup) {
            for (i in 0 until view.childCount) {
                val child = view.getChildAt(i)
                if (isScrollableView(child)) {
                    return child
                }
            }
            
            // 如果直接子视图中没有，再递归搜索
            for (i in 0 until view.childCount) {
                val child = view.getChildAt(i)
                findScrollView(child, depth + 1, maxDepth)?.let {
                    return it
                }
            }
        }
        
        return null
    }
    
    /**
     * 判断视图是否是可滚动视图
     */
    private fun isScrollableView(view: View): Boolean {
        return view is RecyclerView || 
               view is android.widget.ScrollView || 
               view is NestedScrollView ||
               view is android.widget.ListView ||
               view is android.widget.GridView
    }
    
    /**
     * 在找到的可滚动视图上设置SmartRefreshLayout
     */
    private fun setupRefreshControls() {
        // 防止重复设置
        if (hasSetupRefreshControls) {
            println("⚠️ PullRefresh: 刷新控件已设置，跳过重复设置")
            return
        }
        
        // 如果已经有SmartRefreshLayout，先移除
        refreshLayout?.let {
            removeView(it)
        }
        
        // 创建SmartRefreshLayout
        val layout = SmartRefreshLayout(context).apply {
            layoutParams = LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
            
            // 使用自定义的 Lottie Header，实现类似 SmartRefreshLottie 的动画效果
            val header = LottieRefreshHeader(context)
            setRefreshHeader(header)

            // 设置上拉加载 Footer 为 SmartRefreshLayout 示例中的「球脉冲」样式
            val footer = BallPulseFooter(context).apply {
                setSpinnerStyle(SpinnerStyle.Scale)
                setAnimatingColor(android.graphics.Color.GRAY)
            }
            setRefreshFooter(footer)
            
            // 设置下拉刷新监听
            setOnRefreshListener(object : OnRefreshListener {
                override fun onRefresh(layout: RefreshLayout) {
                    this@PullRefreshView.isRefreshing = true
                    mainHandler.post {
                        this@PullRefreshView.onRefresh(emptyMap<String, Any>())
                    }
                }
            })
            
            // 设置上拉加载监听
            setOnLoadMoreListener(object : OnLoadMoreListener {
                override fun onLoadMore(layout: RefreshLayout) {
                    this@PullRefreshView.isLoadingMore = true
                    mainHandler.post {
                        this@PullRefreshView.onLoadMore(emptyMap<String, Any>())
                    }
                }
            })
            
            // 应用初始配置
            setEnableRefresh(refreshEnabled)
            setEnableLoadMore(loadMoreEnabled)
        }
        
        // 将所有现有子视图移动到SmartRefreshLayout中
        val childrenToMove = mutableListOf<View>()
        for (i in 0 until childCount) {
            childrenToMove.add(getChildAt(i))
        }
        
        removeAllViews()
        
        // 将子视图添加到SmartRefreshLayout
        childrenToMove.forEach { child ->
            layout.addView(child)
        }
        
        // 将SmartRefreshLayout添加到当前视图
        addView(layout)
        
        refreshLayout = layout
        hasSetupRefreshControls = true
        
        // 更新文字
        updateRefreshTexts()
        
        println("✅ PullRefresh: 刷新控件设置成功")
    }
    
    /**
     * 更新刷新相关文字
     */
    private fun updateRefreshTexts() {
        // 当前使用 BezierRadarHeader + BallPulseFooter，它们内部自带文案和动画效果，
        // SmartRefreshLayout 暂未提供稳定的多状态文本设置 API，因此这里暂不修改文案，
        // 如需进一步自定义，可在后续版本中通过自定义 Header/Footer 实现。
    }
    
    /**
     * 结束下拉刷新（线程安全）
     */
    fun endRefresh() {
        mainHandler.post {
            if (isRefreshing) {
                isRefreshing = false
                refreshLayout?.finishRefresh()
            }
        }
    }
    
    /**
     * 结束上拉加载（线程安全）
     */
    fun endLoadMore() {
        mainHandler.post {
            if (isLoadingMore) {
                isLoadingMore = false
                refreshLayout?.finishLoadMore()
            }
        }
    }
    
    /**
     * 没有更多数据（线程安全）
     */
    fun noMoreData() {
        mainHandler.post {
            isLoadingMore = false
            refreshLayout?.finishLoadMoreWithNoMoreData()
        }
    }
    
    /**
     * 重置没有更多数据状态（线程安全）
     */
    fun resetNoMoreData() {
        mainHandler.post {
            refreshLayout?.setNoMoreData(false)
        }
    }
    
    /**
     * 启用/禁用下拉刷新
     */
    fun setRefreshEnabled(enabled: Boolean) {
        refreshEnabled = enabled
        mainHandler.post {
            refreshLayout?.setEnableRefresh(enabled)
        }
    }
    
    /**
     * 启用/禁用上拉加载
     */
    fun setLoadMoreEnabled(enabled: Boolean) {
        loadMoreEnabled = enabled
        mainHandler.post {
            refreshLayout?.setEnableLoadMore(enabled)
        }
    }
    
    /**
     * 设置刷新文字
     */
    fun setRefreshingText(text: String) {
        refreshingText = text
        mainHandler.post {
            updateRefreshTexts()
        }
    }
    
    /**
     * 设置加载更多文字
     */
    fun setLoadMoreText(text: String) {
        loadMoreText = text
        mainHandler.post {
            updateRefreshTexts()
        }
    }
    
    /**
     * 通过key控制刷新状态
     */
    fun setRefreshingKey(key: String) {
        if (key != currentRefreshingKey && key.isNotEmpty()) {
            currentRefreshingKey = key
            endRefresh()
        }
    }
    
    /**
     * 通过key控制加载状态
     */
    fun setLoadingKey(key: String) {
        if (key != currentLoadingKey && key.isNotEmpty()) {
            currentLoadingKey = key
            endLoadMore()
        }
    }
    
    /**
     * 设置没有更多数据状态
     */
    fun setNoMoreDataFlag(flag: Boolean) {
        if (flag != currentNoMoreData) {
            currentNoMoreData = flag
            if (flag) {
                noMoreData()
            } else {
                resetNoMoreData()
            }
        }
    }
    
    /**
     * 当子视图添加时触发
     */
    override fun addView(child: View?, index: Int, params: ViewGroup.LayoutParams?) {
        if (child is SmartRefreshLayout) {
            // 如果是SmartRefreshLayout，直接添加
            super.addView(child, index, params)
        } else {
            // 如果还没有设置SmartRefreshLayout
            if (refreshLayout == null) {
                super.addView(child, index, params)
                
                // 延迟尝试设置ScrollView
                mainHandler.post {
                    trySetupScrollView()
                }
            } else {
                // 如果已经有SmartRefreshLayout，将子视图添加到它里面
                refreshLayout?.addView(child, params)
            }
        }
    }
    
    /**
     * 尝试查找并设置ScrollView
     */
    private fun trySetupScrollView() {
        // 如果已经设置过了，不需要再次设置
        if (hasSetupRefreshControls) {
            return
        }
        
        // 检查是否有子视图
        if (childCount == 0) {
            return
        }
        
        // 查找可滚动视图
        var foundScrollView = false
        for (i in 0 until childCount) {
            val child = getChildAt(i)
            if (findScrollView(child) != null) {
                foundScrollView = true
                break
            }
        }
        
        if (foundScrollView) {
            setupRefreshControls()
            println("✅ PullRefresh: 找到可滚动视图")
        } else {
            // 如果还没找到，延迟重试一次
            mainHandler.postDelayed({
                if (!hasSetupRefreshControls && childCount > 0) {
                    for (i in 0 until childCount) {
                        val child = getChildAt(i)
                        if (findScrollView(child) != null) {
                            setupRefreshControls()
                            println("✅ PullRefresh: 延迟查找成功，找到可滚动视图")
                            return@postDelayed
                        }
                    }
                    println("⚠️ PullRefresh: 未找到可滚动视图，请确保子组件包含可滚动视图（ScrollView/FlatList等）")
                }
            }, 50)
        }
    }
    
    /**
     * 清理资源
     */
    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()

        // 清理Handler消息，避免内存泄漏
        mainHandler.removeCallbacksAndMessages(null)

        // 注意：不要在这里清理 SmartRefreshLayout 的监听器
        // 原因：
        // - React Native / Expo Router 在页面切换或 Tab 切换时，View 可能会被从窗口临时移除（detach）
        // - 但 View 实例本身仍然会被复用
        // - 如果在这里把 OnRefreshListener / OnLoadMoreListener 置为 null，
        //   下次页面重新可见时 SmartRefreshLayout 仍然存在，但已经失去监听器，
        //   导致会出现「动画正常播放，但 onRefresh/onLoadMore 不再回调」的问题
        //
        // 如果后续确实需要彻底销毁时清理监听器，可以在真正销毁 View 的场景中统一处理，
        // 或者配合 onAttachedToWindow 重新绑定监听，这里先避免破坏正常回调。

        println("🔄 PullRefresh: 视图已从窗口分离，已清理 Handler 消息")
    }
}
