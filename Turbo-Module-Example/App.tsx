import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  EventSubscription,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
    <>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={num1}
          onChangeText={setNum1}
          keyboardType="numeric"
          placeholder="Enter first number"
        />
        <Text style={styles.operator}>+</Text>
        <TextInput
          style={styles.input}
          value={num2}
          onChangeText={setNum2}
          keyboardType="numeric"
          placeholder="Enter second number"
        />
        <Text style={styles.operator}>={result}</Text>
      </View>

      <Button
        title="Calculate"
        onPress={async () => {
          const value1 = parseFloat(num1) || 0;
          const value2 = parseFloat(num2) || 0;
          const value = await RTNCalculator.add(value1, value2);
          setResult(value ?? null);
        }}
      />
    </>
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
    <View
      style={{marginTop: 30, justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 10,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
            marginRight: 10,
          }}>
          store value:
        </Text>
        <Text
          style={{
            fontSize: 20,
            color: '#ff0000',
            textAlign: 'center',
          }}>
          {value ?? 'No Value'}
        </Text>
      </View>
      <TextInput
        placeholder="Enter the text you want to store"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 5,
          padding: 10,
          width: 200,
          textAlign: 'center',
        }}
        onChangeText={setEditingValue}
      />
      <Button title="Save" onPress={saveValue} />
      <Button title="Delete" onPress={deleteValue} />
      <Button title="Clear" onPress={clearAll} />
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
    <View
      style={{marginTop: 30, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={styles.title}>微信 Turbo Module 演示</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>微信登录</Text>
        <Button title="登录" onPress={handleLogin} />
        <Text style={styles.resultText}>{loginResult}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>微信支付</Text>
        <Button title="支付" onPress={handlePay} />
        <Text style={styles.resultText}>{paymentResult}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>微信分享</Text>
        <View style={styles.row}>
          <Button title="分享链接" onPress={handleShareLink} />
          <View style={styles.buttonSpace} />
          <Button title="分享图片" onPress={handleShareImage} />
        </View>
        <Text style={styles.resultText}>{shareResult}</Text>
      </View>

      <Text style={styles.note}>注意: 请确保已安装微信并配置了正确的AppID</Text>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{flex: 1, paddingVertical: 100}}>
      <ScrollView>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 100,
    textAlign: 'center',
  },
  operator: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  result: {
    fontSize: 18,
    marginBottom: 20,
  },
  // 微信示例
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpace: {
    width: 10,
  },
  resultText: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    minHeight: 20,
  },
  note: {
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
});

export default App;
