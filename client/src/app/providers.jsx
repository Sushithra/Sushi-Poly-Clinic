import { useEffect } from 'react';
import { registerPushToken } from '../services/pushNotifications.js';

export function AppProviders({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      registerPushToken().catch((error) => {
        console.warn('Push registration skipped:', error.message);
      });
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        registerPushToken().catch(() => {});
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return children;
}
