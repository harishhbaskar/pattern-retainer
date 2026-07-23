import { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from '../context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initNotificationService } from '../utils/notifications';
import "./globals.css"

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    initNotificationService();

    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      try {
        router.push('/(tabs)');
      } catch (err) {
        console.error('Failed to navigate on notification response:', err);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}