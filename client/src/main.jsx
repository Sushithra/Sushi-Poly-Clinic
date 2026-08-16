import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import "./services/apiClient.js";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Only use StrictMode in development
if (import.meta.env.DEV) {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
} else {
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}

// Register service worker in production and provide simple update/offline events
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    try {
      registerSW({
        onNeedRefresh() {
          window.dispatchEvent(new CustomEvent('sw:need-refresh'));
        },
        onOfflineReady() {
          window.dispatchEvent(new CustomEvent('sw:offline-ready'));
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Service worker registration failed:', err);
    }
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.error('PWA register import failed:', e);
  });
}
