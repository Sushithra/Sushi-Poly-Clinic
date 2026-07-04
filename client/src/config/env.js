const normalizeUrl = (value) => String(value || '').replace(/\/+$/, '');

export const API_BASE_URL =
  normalizeUrl(import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const IS_BACKEND_URL_DEFAULTED = !(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SERVER_URL
);

export const withApiBase = (path = '') => {
  if (!path) {
    return API_BASE_URL;
  }

  const trimmedPath = String(path).replace(/^\/+/, '');
  return `${API_BASE_URL}/${trimmedPath}`;
};
