package expo.modules.pullrefresh

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.LinearLayout
import com.airbnb.lottie.LottieAnimationView
import com.scwang.smart.refresh.layout.api.RefreshHeader
import com.scwang.smart.refresh.layout.api.RefreshKernel
import com.scwang.smart.refresh.layout.api.RefreshLayout
import com.scwang.smart.refresh.layout.constant.RefreshState
import com.scwang.smart.refresh.layout.constant.SpinnerStyle

/**
 * 自定义 Lottie 下拉刷新 Header
 *
 * 实现思路参考：
 * - SmartRefreshLayout 官方 Lottie 示例头：[SmartRefreshLottie](https://github.com/wapchief/SmartRefreshLottie)
 *   中的 `MyRefreshLottieHeader` 实现。
 *
 * 使用方式：
 * - 默认使用布局中的 `app:lottie_fileName="pull_refresh_lottie.json"`
 * - 你可以在模块或宿主 App 的 `assets` 目录下放入同名 Lottie JSON 文件即可看到动画效果。
 */
class LottieRefreshHeader @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : LinearLayout(context, attrs), RefreshHeader {

    private val animationView: LottieAnimationView

    init {
        orientation = VERTICAL
        // 加载自定义布局，内部只有一个 LottieAnimationView
        val view = LayoutInflater.from(context)
            .inflate(R.layout.pull_refresh_lottie_header, this, true)
        animationView = view.findViewById(R.id.pull_refresh_lottie_view)
    }

    /**
     * 兼容 SmartRefreshLayout 3.x 的 Header 接口
     *
     * 下拉 & 回弹过程统一在 onMoving 中回调，这里暂不根据位移进度修改动画，
     * 仅在真正开始刷新时播放 Lottie 动画。
     */
    override fun onMoving(
        isDragging: Boolean,
        percent: Float,
        offset: Int,
        headerHeight: Int,
        maxDragHeight: Int
    ) {
        // 将下拉位移映射到 0f ~ 1f 的进度，驱动 Lottie 动画
        val fractionFromOffset =
            if (headerHeight > 0) offset.toFloat() / headerHeight.toFloat() else percent
        val progress = fractionFromOffset.coerceIn(0f, 1f)

        if (isDragging) {
            // 拖拽阶段：用进度控制动画帧，不自动播放
            if (animationView.isAnimating) {
                animationView.cancelAnimation()
            }
            animationView.progress = progress
        }
    }

    override fun onReleased(
        refreshLayout: RefreshLayout,
        headerHeight: Int,
        maxDragHeight: Int
    ) = Unit

    override fun getView(): View = this

    override fun getSpinnerStyle(): SpinnerStyle = SpinnerStyle.Translate

    override fun setPrimaryColors(vararg colors: Int) = Unit

    override fun onInitialized(
        kernel: RefreshKernel,
        height: Int,
        extendHeight: Int
    ) = Unit

    override fun onHorizontalDrag(percentX: Float, offsetX: Int, offsetMax: Int) = Unit

    /**
     * 开始刷新动画时触发
     */
    override fun onStartAnimator(
        layout: RefreshLayout,
        height: Int,
        extendHeight: Int
    ) {
        // 触发真正刷新时，从当前进度开始循环播放
        animationView.playAnimation()
    }

    /**
     * 刷新结束时触发
     */
    override fun onFinish(layout: RefreshLayout, success: Boolean): Int {
        animationView.cancelAnimation()
        // 刷新结束后重置到初始帧，便于下次下拉时从 0 开始
        animationView.progress = 0f
        // 返回动画结束延迟时间（毫秒），0 表示立即结束
        return 0
    }

    override fun isSupportHorizontalDrag(): Boolean = false

    override fun onStateChanged(
        refreshLayout: RefreshLayout,
        oldState: RefreshState,
        newState: RefreshState
    ) = Unit

    /**
     * SmartRefreshLayout 3.x 新增：用于自动打开下拉头
     * 这里直接返回 false，交由外部控制是否触发刷新。
     */
    override fun autoOpen(
        height: Int,
        maxDragHeightPercent: Float,
        rebound: Boolean
    ): Boolean = false

    /**
     * 允许在代码中切换 Lottie 动画 JSON 文件
     */
    fun setAnimationFileName(fileName: String) {
        animationView.setAnimation(fileName)
    }
}


