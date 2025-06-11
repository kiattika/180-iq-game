
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all environment variables from .env files based on the mode.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable_icon.png', 'icon-192x192.png', 'icon-512x512.png'],
        manifest: {
          name: '180 IQ : เกมส์คนอัจฉริยะ',
          short_name: '180 IQ',
          description: 'ฝึกสมอง ประลองปัญญา กับเกมส์คณิตศาสตร์สุดท้าทาย',
          theme_color: '#1e293b', // Dark slate blue, as suggested for splash screen
          background_color: '#0f172a', // A similar dark background color (slate-900)
          display: 'fullscreen',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: '/icon-192x192.png', // Path in the public folder
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512x512.png', // Path in the public folder
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/maskable_icon.png', // Path in the public folder for maskable icon
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    }
  }
})