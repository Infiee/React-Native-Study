import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface Props {
  userId: number; // 这里只接收强类型的 props，完全不知道路由的存在
}
export default function UserDetailScreen({ userId }: Props) {
  return <ThemedView>
    <ThemedText>用户id: {userId}</ThemedText>
  </ThemedView>
}