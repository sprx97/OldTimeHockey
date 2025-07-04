import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@constants': '/src/constants',
      '@contexts': '/src/contexts',
      '@types': '/src/types',
      '@assets': '/src/assets',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://roldtimehockey.com/node',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
})
