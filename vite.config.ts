import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ...existing code...

export default defineConfig(async () => {
  // Try to dynamically import the PWA plugin; if it fails, continue without it
  let VitePWA: any = null;
  try {
    const mod = await import('vite-plugin-pwa');
    VitePWA = mod?.VitePWA ?? null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('vite-plugin-pwa could not be loaded, continuing without PWA plugin.', e);
    VitePWA = null;
  }

  const pwaOptions = {
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'Quran Anki - Enhanced',
      short_name: 'Quran Anki',
      description: 'Advanced spaced repetition for Quran memorization',
      theme_color: '#10b981',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'quran-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        }
      ]
    }
  };

  const plugins = [react()];
  if (VitePWA) {
    plugins.push(VitePWA(pwaOptions));
  }

  return {
    plugins
  };
});