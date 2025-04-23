import React, {useEffect, useState} from 'react';
import {
  Alert,
  EventSubscription,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import RTNCalculator from 'rtn-calculator/js/NativeRTNCalculator';
import RTNLocalStorage from 'rtn-localstorage/js/NativeRTNLocalStorage';
import RTNWechat from 'rtn-wechat/js/NativeRTNWechat';

function CalcView() {
  const [num1, setNum1] = useState<string>('3');
  const [num2, setNum2] = useState<string>('7');
  const [result, setResult] = useState<number | null>(null);
  const listenerSubscription = React.useRef<null | EventSubscription>(null);

  React.useEffect(() => {
    listenerSubscription.current = RTNCalculator.onValueChanged(data => {
      Alert.alert(`Result: ${data}`);
    });

    return () => {
      listenerSubscription.current?.remove();
      listenerSubscription.current = null;
    };
  }, []);
  return (
    <View style={styles.moduleContainer}>
      <Text style={styles.moduleTitle}>计算器模块</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={num1}
          onChangeText={setNum1}
          keyboardType="numeric"
          placeholder="第一个数"
          placeholderTextColor="#999"
        />
        <Text style={styles.operator}>+</Text>
        <TextInput
          style={styles.input}
          value={num2}
          onChangeText={setNum2}
          keyboardType="numeric"
          placeholder="第二个数"
          placeholderTextColor="#999"
        />
        <View style={styles.resultContainer}>
          <Text style={styles.operator}>=</Text>
          <Text style={styles.resultText}>{result !== null ? result : '?'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          const value1 = parseFloat(num1) || 0;
          const value2 = parseFloat(num2) || 0;
          const value = await RTNCalculator.add(value1, value2);
          setResult(value ?? null);
        }}>
        <Text style={styles.buttonText}>计算</Text>
      </TouchableOpacity>
    </View>
  );
}

// localStorage示例
function LocalStorageView() {
  const [value, setValue] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedValue = RTNLocalStorage?.getItem('myKey');
    setValue(storedValue ?? '');
  }, []);

  function saveValue() {
    RTNLocalStorage?.setItem(editingValue ?? '', 'myKey');
    setValue(editingValue);
  }

  function clearAll() {
    RTNLocalStorage?.clear();
    setValue('');
  }

  function deleteValue() {
    RTNLocalStorage?.removeItem('myKey');
    setValue('');
  }

  return (
    <View style={styles.moduleContainer}>
      <Text style={styles.moduleTitle}>本地存储模块</Text>
      <View style={styles.storageValueContainer}>
        <Text style={styles.storageLabel}>存储的值:</Text>
        <Text style={styles.storageValue}>
          {value ? value : '无存储值'}
        </Text>
      </View>
      
      <TextInput
        placeholder="输入要存储的文本"
        placeholderTextColor="#999"
        style={styles.storageInput}
        onChangeText={setEditingValue}
      />
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.buttonSmall} onPress={saveValue}>
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.buttonSmall, styles.buttonDanger]} onPress={deleteValue}>
          <Text style={styles.buttonText}>删除</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.buttonSmall, styles.buttonWarning]} onPress={clearAll}>
          <Text style={styles.buttonText}>清空</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 定义微信回调响应类型
interface WechatResponse {
  errCode: number;
  errStr: string;
  code?: string;
  state?: string;
}

// 微信示例
function WechatView() {
  const [loginResult, setLoginResult] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<string>('');
  const [shareResult, setShareResult] = useState<string>('');

  // 注册微信事件监听
  useEffect(() => {
    const subscription = RTNWechat?.onAuthResponse(
      (response: WechatResponse) => {
        const {errCode, errStr, code, state} = response;

        if (errCode === 0) {
          if (state === 'wechat_login') {
            // 登录成功
            setLoginResult(`登录成功: Code=${code}`);
          } else if (code === undefined) {
            // 支付或分享成功
            Alert.alert('操作成功', '微信回调成功');
          }
        } else {
          // 操作失败
          Alert.alert('操作失败', `错误码: ${errCode}, 错误信息: ${errStr}`);
        }
      },
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // 微信登录
  const handleLogin = async () => {
    try {
      setLoginResult('登录中...');
      await RTNWechat?.login();
      // 实际结果将在onAuthResponse回调中处理
    } catch (error) {
      setLoginResult(`登录失败: ${error}`);
      Alert.alert('登录失败', String(error));
    }
  };

  // 微信支付
  const handlePay = async () => {
    try {
      setPaymentResult('发起支付...');
      // 注意: 实际参数应该从服务器获取
      const payParams = {
        partnerId: 'your_partner_id',
        prepayId: 'test_prepay_id',
        nonceStr: 'test_nonce_str',
        timeStamp: String(Math.floor(Date.now() / 1000)),
        package: 'Sign=WXPay',
        sign: 'test_sign',
      };

      await RTNWechat?.pay(payParams);
      // 实际结果将在onAuthResponse回调中处理
    } catch (error) {
      setPaymentResult(`支付失败: ${error}`);
      Alert.alert('支付失败', String(error));
    }
  };

  // 微信分享链接
  const handleShareLink = async () => {
    try {
      setShareResult('分享中...');
      const shareParams = {
        title: '分享标题',
        description: '分享描述内容',
        thumbUrl: 'https://reactnative.dev/img/tiny_logo.png',
        webpageUrl: 'https://reactnative.dev',
        scene: 0, // 0: 分享到会话
      };

      await RTNWechat?.shareLink(shareParams);
      // 实际结果将在onAuthResponse回调中处理
    } catch (error) {
      setShareResult(`分享失败: ${error}`);
      Alert.alert('分享失败', String(error));
    }
  };

  // 微信分享图片
  const handleShareImage = async () => {
    try {
      setShareResult('分享图片中...');
      const shareParams = {
        image: 'https://reactnative.dev/img/logo-og.png',
        scene: 0, // 0: 分享到会话
      };

      await RTNWechat?.shareImage(shareParams);
      // 实际结果将在onAuthResponse回调中处理
    } catch (error) {
      setShareResult(`分享图片失败: ${error}`);
      Alert.alert('分享图片失败', String(error));
    }
  };

  return (
    <View style={styles.moduleContainer}>
      <Text style={styles.moduleTitle}>微信 Turbo Module 演示</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>微信登录</Text>
        <TouchableOpacity style={styles.wechatButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>登录</Text>
        </TouchableOpacity>
        <Text style={styles.resultStatus}>{loginResult}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>微信支付</Text>
        <TouchableOpacity style={styles.wechatButton} onPress={handlePay}>
          <Text style={styles.buttonText}>支付</Text>
        </TouchableOpacity>
        <Text style={styles.resultStatus}>{paymentResult}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>微信分享</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.wechatButtonSmall, {marginRight: 10}]} onPress={handleShareLink}>
            <Text style={styles.buttonText}>分享链接</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.wechatButtonSmall} onPress={handleShareImage}>
            <Text style={styles.buttonText}>分享图片</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.resultStatus}>{shareResult}</Text>
      </View>

      <Text style={styles.note}>注意: 请确保已安装微信并配置了正确的AppID</Text>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.appTitle}>Turbo Module 示例</Text>
        {/* calc */}
        <CalcView />
        {/* localstorage */}
        <LocalStorageView />
        {/* wechat */}
        <WechatView />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  moduleContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: 100,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  operator: {
    fontSize: 24,
    marginHorizontal: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // LocalStorage styles
  storageValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  storageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  storageValue: {
    fontSize: 16,
    color: '#4CAF50',
    flex: 1,
  },
  storageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSmall: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonDanger: {
    backgroundColor: '#F44336',
  },
  buttonWarning: {
    backgroundColor: '#FF9800',
  },
  // Wechat styles
  section: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  wechatButton: {
    backgroundColor: '#07C160',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  wechatButtonSmall: {
    backgroundColor: '#07C160',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultStatus: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
    color: '#333',
    fontSize: 14,
  },
  note: {
    marginTop: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default App;
