import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // API proxy to support backend
  server: {
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV ? 'http://backend:8000' : 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large vendor libraries for better caching and parallel loading
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          'motion-vendor': ['motion/react'],
          'chart-vendor': ['recharts'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'form-vendor': ['react-hook-form'],
        },
      },
    },
  },
})
