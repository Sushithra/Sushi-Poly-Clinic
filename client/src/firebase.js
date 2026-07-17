import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import { getFirebaseConfig, isFirebaseConfigured } from './config/env.js';

const firebaseConfig = getFirebaseConfig();
const firebaseReady = isFirebaseConfigured();

export const firebaseApp = firebaseReady
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const firebaseMessaging = async () => {
  if (!firebaseApp || !(await isMessagingSupported())) {
    return null;
  }

  return getMessaging(firebaseApp);
};

export const firebaseAnalytics = async () => {
  if (!firebaseApp || !firebaseConfig.measurementId || !(await isAnalyticsSupported())) {
    return null;
  }

  return getAnalytics(firebaseApp);
};

export const firebaseIsReady = firebaseReady;
