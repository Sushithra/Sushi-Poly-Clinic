import { useEffect, useMemo, useState } from 'react';
import { registerPushToken } from '../services/pushNotifications.js';

export function AppProviders({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const alreadyInstalled =
      window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const dismissed = window.localStorage.getItem('pwa-install-dismissed') === 'true';

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanInstall(false);
      window.localStorage.removeItem('pwa-install-dismissed');
    };

    if (!alreadyInstalled && !dismissed && 'onbeforeinstallprompt' in window) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    window.localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const dismissInstall = () => {
    setDeferredPrompt(null);
    setCanInstall(false);
    window.localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const showInstallBanner = useMemo(() => canInstall && !!deferredPrompt, [canInstall, deferredPrompt]);

  return children;
}
