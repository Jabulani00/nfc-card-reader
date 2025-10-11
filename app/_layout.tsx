import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen 
              name="login" 
              options={{ 
                title: 'Login', 
                headerShown: true,
                headerBackTitle: 'Home'
              }} 
            />
            <Stack.Screen 
              name="signup" 
              options={{ 
                title: 'Sign Up', 
                headerShown: true,
                headerBackTitle: 'Home'
              }} 
            />
            <Stack.Screen 
              name="forgot-password" 
              options={{ 
                title: 'Forgot Password', 
                headerShown: true,
                headerBackTitle: 'Login'
              }} 
            />
            <Stack.Screen 
              name="add-user" 
              options={{ 
                title: 'Add User', 
                headerShown: true,
                presentation: 'modal'
              }} 
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(staff)" options={{ headerShown: false }} />
          <Stack.Screen name="(student)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="pending-approval" 
            options={{ 
              title: 'Pending Approval', 
              headerShown: false
            }} 
          />
        </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
