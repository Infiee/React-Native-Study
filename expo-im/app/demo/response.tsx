import { useAppResponsive } from '@/hooks/use-responsive';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { createStyles } from './styles';

export default function ResponsiveDemo() {
  // 1. 获取响应式工具
  const responsive = useAppResponsive();
  const { rs, rf, select, breakpoint, width } = responsive;

  // 2. 创建响应式样式
  // 使用 useMemo 确保仅在 responsive 变化时重新计算样式
  const styles = useMemo(() => createStyles(responsive), [responsive]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Responsive Box</Text>
        <Text style={styles.subtitle}>
          Current Breakpoint: {breakpoint.toUpperCase()}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>Inline Responsive Logic</Text>

        {/* 3. 页面内部直接使用响应式逻辑 (Inline) */}
        <Text style={styles.infoText}>
          Screen Width: {width.toFixed(0)}
        </Text>

        <Text style={[
          styles.infoText,
          {
            color: select({ sm: 'red', md: 'blue', lg: 'green' }),
            fontWeight: select({ sm: 'normal', lg: 'bold' })
          }
        ]}>
          Dynamic Color & Weight (Inline)
        </Text>

        <Text style={{
          marginTop: rs(20),
          fontSize: rf(18),
          color: '#333'
        }}>
          Scaled Margin & Font Size (Inline)
        </Text>

        {/* 条件渲染 */}
        {select({
          sm: <Text style={styles.infoText}>📱 Mobile View</Text>,
          md: <Text style={styles.infoText}>📄 Tablet View</Text>,
          lg: <Text style={styles.infoText}>🖥️ Desktop View</Text>
        })}
      </View>
    </ScrollView>
  );
}
