
import UserDetailScreen from '@/features/user/screens/UserDetailScreen';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log(id);
  return (
    <>
      <Stack.Screen options={{ title: '用户详情' }} />
      {/* 将 ID 传递给真正的业务屏幕组件 */}
      <UserDetailScreen userId={Number(id)} />
    </>
  )
}