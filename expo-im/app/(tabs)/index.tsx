import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import NetInfo from '@react-native-community/netinfo';
import TencentCloudChat from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';
// import * as NetInfo from 'expo-network';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

let options = {
  SDKAppID: 1400656477 // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
};

export default function HomeScreen() {
  const [netState, setNetState] = useState('')

  useEffect(() => {
    // 创建 SDK 实例，`TencentCloudChat.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    let chat = TencentCloudChat.create(options); // SDK 实例通常用 chat 表示

    chat.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用

    // 注册腾讯云即时通信富媒体资源上传插件
    chat.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
    // 注册网络监听插件
    chat.registerPlugin({ 'chat-network-monitor': NetInfo });

    const handleNetwork = (event: any) => {
      console.log('【网络状态变化】：', event);
      setNetState(event.data.state)
    }

    chat.on(TencentCloudChat.EVENT.NET_STATE_CHANGE, handleNetwork);
  }, [])

  return (
    <SafeAreaView>
      <ThemedView>
        <ThemedText>网络状态：{netState}</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
