import { TurboModule, TurboModuleRegistry } from "react-native";
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  // 检查微信是否已安装
  isWXAppInstalled(): Promise<boolean>;
  
  // 微信登录
  login(): Promise<{
    code: string;
    state: string;
  }>;
  
  // 微信支付
  pay(params: {
    partnerId: string;
    prepayId: string;
    nonceStr: string;
    timeStamp: string;
    package: string;
    sign: string;
  }): Promise<{
    errCode: number;
    errStr: string;
  }>;
  
  // 微信分享(链接)
  shareLink(params: {
    title: string;
    description: string;
    thumbUrl: string;
    webpageUrl: string;
    scene: number; // 0: 会话 1: 朋友圈 2: 收藏
  }): Promise<{
    errCode: number;
    errStr: string;
  }>;
  
  // 微信分享(图片)
  shareImage(params: {
    image: string;
    scene: number; // 0: 会话 1: 朋友圈 2: 收藏
  }): Promise<{
    errCode: number;
    errStr: string;
  }>;
  
  // 事件监听器 - 处理从原生端返回的事件
  readonly onAuthResponse: EventEmitter<{
    errCode: number;
    errStr: string;
    code?: string;
    state?: string;
  }>;
}

export default TurboModuleRegistry.get<Spec>("RTNWechat") as Spec | null; 