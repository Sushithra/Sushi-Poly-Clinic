import axios from 'axios';
import { getToken } from 'firebase/messaging';
import { API_BASE_URL, FIREBASE_VAPID_KEY, buildFirebaseMessagingSwUrl, isFirebaseConfigured } from '../config/env.js';
import { firebaseMessaging } from '../firebase.js';

const PUSH_TOKEN_STORAGE_KEY = 'eclinic.push.token';
const PUSH_SESSION_STORAGE_KEY = 'eclinic.push.session';

const readSession = (session) => {
  if (session) return session;

  try {
    const doctorInfo = localStorage.getItem('doctorInfo');
    const userInfo = localStorage.getItem('userInfo');

    if (doctorInfo) return JSON.parse(doctorInfo);
    if (userInfo) return JSON.parse(userInfo);
  } catch {
    return null;
  }

  return null;
};

const sessionKeyFor = (session) => `${session?.role || 'user'}:${session?._id || session?.id || session?.email || 'anonymous'}`;

export const registerPushToken = async (session = null) => {
  const currentSession = readSession(session);

  if (!currentSession?.token || !isFirebaseConfigured()) {
    return null;
  }

  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  if (Notification.permission === 'denied') {
    return null;
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission !== 'granted') {
    return null;
  }

  if (!FIREBASE_VAPID_KEY) {
    return null;
  }

  const messaging = await firebaseMessaging();
  if (!messaging) {
    return null;
  }

  const serviceWorkerRegistration = await navigator.serviceWorker.register(buildFirebaseMessagingSwUrl());
  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (!token) {
    return null;
  }

  const sessionKey = sessionKeyFor(currentSession);
  const storedToken = localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  const storedSessionKey = localStorage.getItem(PUSH_SESSION_STORAGE_KEY);

  if (storedToken === token && storedSessionKey === sessionKey) {
    return token;
  }

  await axios.post(
    `${API_BASE_URL}/api/auth/push-token`,
    { token },
    { headers: { Authorization: `Bearer ${currentSession.token}` } },
  );

  localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(PUSH_SESSION_STORAGE_KEY, sessionKey);
  return token;
};

export const clearPushTokenCache = () => {
  localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(PUSH_SESSION_STORAGE_KEY);
};
