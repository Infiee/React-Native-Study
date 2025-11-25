# User Hooks 使用文档

基于 React Query 和 Zustand 的用户管理 Hooks。

## 📦 架构设计

```
features/user/hooks/
├── useUser.ts          # 查询操作 (React Query)
├── useUserAction.ts    # 修改操作 (React Query Mutations)
└── index.ts            # 统一导出
```

### 设计原则

- **读写分离**: `useUser` 负责查询，`useUserAction` 负责修改
- **双层状态管理**: React Query 管理服务器状态 + Zustand 管理客户端状态
- **自动同步**: React Query 数据自动同步到 Zustand Store
- **乐观更新**: 修改操作支持乐观更新，提升用户体验
- **智能缓存**: 自动管理缓存失效和重新获取

---

## 🔍 查询 Hooks (useUser.ts)

### 1. useUserProfile - 获取当前用户资料

```typescript
import { useUserProfile } from '@/features/user/hooks';

function ProfileScreen() {
  const {
    data: profile,      // 用户资料数据
    isLoading,          // 加载状态
    error,              // 错误信息
    refetch             // 手动刷新
  } = useUserProfile();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorView error={error} />;

  return (
    <View>
      <Text>{profile?.nickname}</Text>
      <Button onPress={() => refetch()} title="刷新" />
    </View>
  );
}
```

**特性:**
- ✅ 自动缓存 5 分钟
- ✅ 自动同步到 Zustand Store
- ✅ 支持后台自动刷新

---

### 2. useUserById - 根据 ID 获取用户

```typescript
import { useUserById } from '@/features/user/hooks';

function UserDetailScreen({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUserById(userId);

  // 条件查询：只有当 userId 存在时才查询
  const { data: user } = useUserById(userId, {
    enabled: !!userId
  });

  return <UserCard user={user} />;
}
```

---

### 3. useUserSettings - 获取用户设置

```typescript
import { useUserSettings } from '@/features/user/hooks';

function SettingsScreen() {
  const {
    data: settings,
    isLoading,
    refetch
  } = useUserSettings();

  return (
    <Switch
      value={settings?.notifications}
      disabled={isLoading}
    />
  );
}
```

---

### 4. useUser - 组合 Hook (推荐)

同时获取用户资料和设置，适用于需要完整用户信息的场景。

```typescript
import { useUser } from '@/features/user/hooks';

function DashboardScreen() {
  const {
    profile,              // 用户资料
    settings,             // 用户设置
    isLoading,            // 任一加载中
    isProfileLoading,     // 资料加载中
    isSettingsLoading,    // 设置加载中
    error,                // 任一错误
    refetchAll,           // 刷新所有
    invalidateAll,        // 失效所有缓存
  } = useUser();

  useEffect(() => {
    // 组件挂载时，数据会自动获取
  }, []);

  const handleRefresh = async () => {
    await refetchAll(); // 同时刷新资料和设置
  };

  return (
    <View>
      <Avatar source={{ uri: profile?.avatar }} />
      <Text>{profile?.nickname}</Text>
      <Switch value={settings?.notifications} />
      <Button onPress={handleRefresh} title="刷新" />
    </View>
  );
}
```

---

## ✏️ 修改 Hooks (useUserAction.ts)

### 1. useUpdateProfile - 更新用户资料

```typescript
import { useUpdateProfile } from '@/features/user/hooks';
import { Alert } from 'react-native';

function EditProfileScreen() {
  const {
    mutate,               // 不等待结果
    mutateAsync,          // 等待结果 (推荐)
    isPending,            // 加载状态
    error,                // 错误信息
  } = useUpdateProfile();

  // 方式 1: 使用 mutateAsync (推荐)
  const handleSave = async () => {
    try {
      const updated = await mutateAsync({
        nickname: '新昵称',
        bio: '个人简介'
      });
      Alert.alert('成功', '资料已更新');
      navigation.goBack();
    } catch (error) {
      Alert.alert('失败', '更新失败，请重试');
    }
  };

  // 方式 2: 使用 mutate (Fire and forget)
  const handleQuickUpdate = () => {
    mutate({ nickname: '新昵称' }, {
      onSuccess: (data) => {
        Alert.alert('成功', '更新成功');
      },
      onError: (error) => {
        Alert.alert('失败', '更新失败');
      },
    });
  };

  return (
    <View>
      <TextInput placeholder="昵称" />
      <Button
        onPress={handleSave}
        title="保存"
        disabled={isPending}
      />
    </View>
  );
}
```

**乐观更新:**
- ✅ UI 立即更新，无需等待服务器响应
- ✅ 请求失败自动回滚
- ✅ 成功后自动失效相关缓存

---

### 2. useUploadAvatar - 上传头像

```typescript
import { useUploadAvatar } from '@/features/user/hooks';
import * as ImagePicker from 'expo-image-picker';

function AvatarUploadScreen() {
  const { mutateAsync, isPending } = useUploadAvatar();

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      try {
        const avatarUrl = await mutateAsync(formData);
        Alert.alert('成功', '头像已更新');
      } catch (error) {
        Alert.alert('失败', '上传失败');
      }
    }
  };

  return (
    <Button
      onPress={handlePickImage}
      title="上传头像"
      disabled={isPending}
    />
  );
}
```

---

### 3. useUpdateSettings - 更新设置

```typescript
import { useUpdateSettings } from '@/features/user/hooks';

function NotificationSettingsScreen() {
  const { mutate, isPending } = useUpdateSettings();

  const handleToggleNotification = (value: boolean) => {
    mutate({ notifications: value }, {
      onSuccess: () => {
        // 已自动同步到 store 和缓存
      },
    });
  };

  return (
    <Switch
      value={settings?.notifications}
      onValueChange={handleToggleNotification}
      disabled={isPending}
    />
  );
}
```

---

### 4. useUserAction - 组合 Hook (推荐)

```typescript
import { useUserAction } from '@/features/user/hooks';

function UserManagementScreen() {
  const {
    // 修改方法
    updateProfileAsync,
    uploadAvatarAsync,
    updateSettingsAsync,

    // 加载状态
    isUpdating,           // 任一操作进行中
    isUpdatingProfile,
    isUploadingAvatar,
    isUpdatingSettings,

    // 错误状态
    updateProfileError,
    uploadAvatarError,
    updateSettingsError,

    // 工具方法
    clearUser,            // 登出时清除数据
    resetQueries,         // 重置查询状态
  } = useUserAction();

  const handleLogout = () => {
    clearUser(); // 清除 Store + React Query 缓存
    navigation.replace('Login');
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfileAsync({ nickname: '新昵称' });
    } catch (error) {
      // 已自动处理错误和回滚
    }
  };

  return (
    <View>
      <Button
        onPress={handleUpdateProfile}
        disabled={isUpdating}
        title="更新资料"
      />
      <Button onPress={handleLogout} title="登出" />
    </View>
  );
}
```

---

## 🎯 最佳实践

### 1. 组件中组合使用

```typescript
import { useUser, useUserAction } from '@/features/user/hooks';

function CompleteUserScreen() {
  // 查询数据
  const {
    profile,
    settings,
    isLoading,
    refetchAll
  } = useUser();

  // 修改操作
  const {
    updateProfileAsync,
    updateSettingsAsync,
    isUpdating
  } = useUserAction();

  const handleSave = async () => {
    try {
      await Promise.all([
        updateProfileAsync({ nickname: 'New Name' }),
        updateSettingsAsync({ notifications: true }),
      ]);
      await refetchAll(); // 刷新数据
      Alert.alert('成功');
    } catch (error) {
      Alert.alert('失败');
    }
  };

  return (
    <View>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <UserInfo profile={profile} />
          <SettingsPanel settings={settings} />
          <Button
            onPress={handleSave}
            disabled={isUpdating}
            title="保存"
          />
        </>
      )}
    </View>
  );
}
```

---

### 2. 手动失效缓存

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { userQueryKeys } from '@/features/user/hooks';

function SomeComponent() {
  const queryClient = useQueryClient();

  const handleExternalUpdate = () => {
    // 失效特定查询
    queryClient.invalidateQueries({
      queryKey: userQueryKeys.profile()
    });

    // 失效所有用户相关查询
    queryClient.invalidateQueries({
      queryKey: userQueryKeys.all
    });
  };
}
```

---

### 3. 预取数据

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { userQueryKeys } from '@/features/user/hooks';
import { getUserById } from '@/api/endpoints/user';

function UserListScreen() {
  const queryClient = useQueryClient();

  const handlePrefetchUser = (userId: string) => {
    // 鼠标悬停时预取数据
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.profileById(userId),
      queryFn: () => getUserById(userId),
    });
  };

  return (
    <Pressable onHoverIn={() => handlePrefetchUser('123')}>
      <Text>User 123</Text>
    </Pressable>
  );
}
```

---

## 🔑 Query Keys 说明

```typescript
export const userQueryKeys = {
  all: ['user'],                      // ['user']
  profile: () => ['user', 'profile'], // ['user', 'profile']
  profileById: (id) => ['user', 'profile', id], // ['user', 'profile', '123']
  settings: () => ['user', 'settings'], // ['user', 'settings']
};
```

**用途:**
- 统一管理查询键，避免硬编码
- 支持层级失效（失效 `['user']` 会失效所有子查询）
- 便于调试和追踪

---

## ⚙️ 配置说明

### 缓存时间配置

```typescript
// useUserProfile
staleTime: 5 * 60 * 1000,   // 5分钟内数据是新鲜的
gcTime: 10 * 60 * 1000,     // 10分钟后清除缓存

// useUserSettings
staleTime: 10 * 60 * 1000,  // 10分钟内数据是新鲜的
gcTime: 30 * 60 * 1000,     // 30分钟后清除缓存
```

**可根据业务需求调整:**
- 用户资料变化不频繁，可增加 `staleTime`
- 设置很少变化，可进一步增加缓存时间

---

## 🚀 性能优化

### 1. 避免不必要的重新渲染

```typescript
// ❌ 不推荐：每次都创建新对象
const profile = useUserStore((state) => state.profile);

// ✅ 推荐：使用 React Query
const { data: profile } = useUserProfile();

// ✅ 或者使用浅比较
const profile = useUserStore(
  (state) => state.profile,
  shallow
);
```

### 2. 选择性订阅

```typescript
// 只订阅需要的字段
const nickname = useUserStore((state) => state.profile?.nickname);
const avatar = useUserStore((state) => state.profile?.avatar);
```

---

## 📚 相关资源

- [React Query 文档](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [项目 API 文档](../../../api/endpoints/user/README.md)

---

## ❓ 常见问题

### Q: 为什么需要 Zustand + React Query？

**A:**
- **React Query**: 管理服务器状态（缓存、重试、失效）
- **Zustand**: 管理客户端状态（临时数据、UI 状态）
- 两者结合提供最佳的开发体验和性能

### Q: 数据会重复存储吗？

**A:** 是的，但这是设计上的权衡：
- React Query 缓存用于网络层优化
- Zustand Store 用于跨组件共享和持久化
- 自动同步保证数据一致性

### Q: 如何处理离线状态？

**A:** React Query 支持离线模式：
```typescript
const { data, isLoading, isError, error } = useUserProfile();

// 离线时使用缓存数据
if (isError && error.message.includes('Network')) {
  // 显示离线提示，但仍显示缓存数据
}
```

### Q: 乐观更新失败怎么办？

**A:** 自动回滚机制：
- `onMutate`: 保存旧数据
- `onError`: 自动恢复旧数据
- 用户无感知，体验流畅
