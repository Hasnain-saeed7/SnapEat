
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
plugins: [
react(),
VitePWA({
registerType: 'autoUpdate',
injectRegister: 'auto',
includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
manifest: {
name: 'SnapEat',
short_name: 'SnapEat',
description: 'Order food and explore reels on SnapEat',
theme_color: '#e94e1b',
background_color: '#fff7f2',
display: 'standalone',
orientation: 'portrait',
start_url: '/',
scope: '/',
icons: [
{
src: '/pwa-192x192.png',
sizes: '192x192',
type: 'image/png'
},
{
src: '/pwa-512x512.png',
sizes: '512x512',
type: 'image/png'
},
{
src: '/pwa-512x512-maskable.png',
sizes: '512x512',
type: 'image/png',
purpose: 'any maskable'
}
]
},
 workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  navigateFallback: '/index.html'
}
})
]
})
