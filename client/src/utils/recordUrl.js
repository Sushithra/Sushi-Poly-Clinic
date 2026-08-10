import { API_BASE_URL } from '../config/env.js';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

export const resolveRecordUrl = (value) => {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';

  const baseUrl = API_BASE_URL || '';

  try {
    const url = new URL(rawValue);

    if (LOCAL_HOSTNAMES.has(url.hostname) && baseUrl) {
      const base = new URL(baseUrl);
      return `${base.origin}${url.pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  } catch {
    if (!baseUrl) return rawValue;
    return `${baseUrl.replace(/\/+$/, '')}/${rawValue.replace(/^\/+/, '')}`;
  }
};
