import { NativeModule, requireNativeModule } from 'expo';

// 定义原生模块接口
declare class PullRefreshModule extends NativeModule {
  // 这里可以添加模块级别的方法（如果需要）
}

// 加载原生模块
const nativeModule = requireNativeModule<PullRefreshModule>('PullRefresh');

export default nativeModule;


