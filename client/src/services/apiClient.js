import axios from 'axios';
import { API_BASE_URL } from '../config/env.js';

const LOCAL_BACKEND_ORIGINS = ['http://localhost:5000', 'https://localhost:5000'];

const rewriteLocalBackendUrl = (url) => {
  if (typeof url !== 'string') {
    return url;
  }

  for (const origin of LOCAL_BACKEND_ORIGINS) {
    if (url.startsWith(origin)) {
      return `${API_BASE_URL}${url.slice(origin.length)}`;
    }
  }

  return url;
};

axios.interceptors.request.use((config) => {
  if (config.url) {
    config.url = rewriteLocalBackendUrl(config.url);
  }

  if (config.baseURL) {
    config.baseURL = rewriteLocalBackendUrl(config.baseURL);
  }

  return config;
});

export default axios;
