import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '../contexts/AuthContext';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { WebAlertProvider } from '@/contexts/WebAlertProvider';

export default function RootLayout() {
  useFrameworkReady();
  
  const app = (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
    )

  if (Platform.OS === 'web') {
      return <WebAlertProvider>{app}</WebAlertProvider>;
    } 

  return (
    app
  );
}