import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png'],
      manifest: {
        name: 'CashLinkS',
        short_name: 'CashLink',
        description: 'Connecting Africans in UAE with trusted money agents, businesses, jobs, and community services',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          // "any" purpose icons - for general use
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          // Note: 384x384 is optional, removed to avoid size mismatch
          // Only 192x192 and 512x512 are required
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          // "maskable" purpose icons - for Android adaptive icons
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          // Mobile screenshots (portrait) - narrow form factor
          {
            src: '/screenshots/mobile- (1).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Welcome Screen'
          },
          {
            src: '/screenshots/mobile- (2).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'GetCash Service'
          },
          {
            src: '/screenshots/mobile- (3).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Jobs Listing'
          },
          {
            src: '/screenshots/mobile- (4).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Marketplace'
          },
          {
            src: '/screenshots/mobile- (5).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Events'
          },
          {
            src: '/screenshots/mobile- (6).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Business Directory'
          },
          {
            src: '/screenshots/mobile- (7).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Community Services'
          },
          {
            src: '/screenshots/mobile- (8).jpeg',
            sizes: '540x960',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Profile'
          },
          // Desktop screenshots (landscape) - wide form factor
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Home Dashboard'
          },
          {
            src: '/screenshots/desktop2.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Business Directory'
          },
          {
            src: '/screenshots/desktop3.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Community Services'
          }
        ],
        categories: ['business', 'social', 'lifestyle'],
        shortcuts: [
          {
            name: 'Get Cash',
            short_name: 'GetCash',
            description: 'Find money agents',
            url: '/get-cash',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Jobs',
            short_name: 'Jobs',
            description: 'Browse job opportunities',
            url: '/jobs',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-static-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for production to reduce size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'utils-vendor': ['date-fns', 'framer-motion']
        }
      }
    }
  },
});
