import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Header,
  HeaderBackButton,
  getHeaderTitle,
} from '@react-navigation/elements';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          // headerTransparent: true,
          header: ({ options, route, back, navigation }) => {
            // log.info('header', options, route, back);
            return (
              <Header
                {...options}
                back={back}
                title={getHeaderTitle(options, route.name)}
                headerTintColor="#ff6b6b"
                headerStyle={
                  {
                    // backgroundColor: 'red', // 透明背景
                    // 若需要完全透明，可去除任何阴影
                    // elevation: 0,
                    // shadowOpacity: 0,
                    // borderBottomWidth: 0,
                  }
                }
                headerTransparent={true}
                headerLeft={props =>
                  back && (
                    <HeaderBackButton
                      {...props}
                      onPress={navigation.goBack}
                      tintColor="gray"
                      label={back.title}
                    />
                  )
                }
              />
            );
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
