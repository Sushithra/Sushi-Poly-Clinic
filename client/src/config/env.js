const normalizeUrl = (value) => String(value || '').replace(/\/+$/, '');

export const API_BASE_URL =
  normalizeUrl(import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';
export const FIREBASE_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
export const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
export const FIREBASE_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
export const FIREBASE_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
export const FIREBASE_APP_ID = import.meta.env.VITE_FIREBASE_APP_ID || '';
export const FIREBASE_MEASUREMENT_ID = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '';
export const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
export const IS_BACKEND_URL_DEFAULTED = !(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SERVER_URL
);

export const isFirebaseConfigured = () =>
  Boolean(FIREBASE_API_KEY && FIREBASE_AUTH_DOMAIN && FIREBASE_PROJECT_ID && FIREBASE_STORAGE_BUCKET && FIREBASE_MESSAGING_SENDER_ID && FIREBASE_APP_ID);

export const getFirebaseConfig = () => ({
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID || undefined,
});

export const buildFirebaseMessagingSwUrl = () => {
  const params = new URLSearchParams();
  const config = getFirebaseConfig();

  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return `/firebase-messaging-sw.js?${params.toString()}`;
};

export const withApiBase = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  const trimmedPath = String(path).replace(/^\/+/, '');
  return `${API_BASE_URL}/${trimmedPath}`;
};
