import { StyleSheet } from 'react-native';

// 定义一个类型，告诉生成器我们需要什么参数
// 这里的类型定义可以根据 hooks/use-responsive.ts 中的返回值进行调整
type StyleProps = {
  select: <T>(config: any) => T | undefined;
  rs: (size: number) => number;
  rf: (size: number) => number;
  width: number;
  height?: number;
};

// 导出一个函数，而不是对象
// 这样我们可以在组件内部根据当前的 responsive 状态动态生成样式
export const createStyles = ({ select, rs, rf, width }: StyleProps) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: rs(20),
      // 宏观布局：大屏左对齐，小屏居中
      alignItems: select({ sm: 'center', lg: 'flex-start' }),
      justifyContent: 'center',
    },
    box: {
      // 微观尺寸：根据屏幕宽度适度缩放
      width: rs(300),
      height: rs(200),
      backgroundColor: select({ sm: '#4a90e2', md: '#50e3c2', lg: '#b8e986' }),
      borderRadius: rs(10),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: rs(20),
      // 阴影也可以响应式
      shadowColor: '#000',
      shadowOffset: { width: 0, height: rs(4) },
      shadowOpacity: 0.2,
      shadowRadius: rs(8),
      elevation: 5,
    },
    title: {
      // 字体大小响应式
      fontSize: rf(24),
      fontWeight: 'bold',
      color: '#333',
      marginBottom: rs(10),
      textAlign: select({ sm: 'center', lg: 'left' }),
    },
    subtitle: {
      fontSize: rf(16),
      color: '#666',
      textAlign: 'center',
      paddingHorizontal: rs(10),
    },
    infoContainer: {
      marginTop: rs(30),
      padding: rs(15),
      backgroundColor: '#fff',
      borderRadius: rs(8),
      width: '100%',
      maxWidth: rs(500),
    },
    infoText: {
      fontSize: rf(14),
      color: '#444',
      marginVertical: rs(4),
    }
  });
