import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/logo.png'],
      manifest: {
        name: 'Sushi Polyclinic',
        short_name: 'Sushi Polyclinic',
        description: 'Progressive telemedicine web app for patients and doctors.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1e7a6d',
        background_color: '#f4efe7',
        icons: [
          {
            src: '/icons/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,svg,png,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
