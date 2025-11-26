import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUserProfile } from '@/features/user/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native';

interface Props {
  userId: number; // 这里只接收强类型的 props，完全不知道路由的存在
}
export default function UserDetailScreen({ userId }: Props) {

  const {
    data: profile,      // 用户资料数据
    isLoading,          // 加载状态
    error,              // 错误信息
    refetch             // 手动刷新
  } = useUserProfile();

  return <ThemedView>
    <Ionicons name="home" size={24} color="black" />
    <ThemedText>用户id: {userId}</ThemedText>

    <ThemedText>{profile?.nickname}</ThemedText>
    <Button onPress={() => refetch()} title="刷新" />

  </ThemedView>
}
