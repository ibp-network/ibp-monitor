// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

import '../dotenv.js'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './static',
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
  ],
  define: {
    'process.env': {},
    PACKAGE_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: Number(process.env.HTTP_PORT || 30001),
    // https://vitejs.dev/config/server-options.html#server-proxy
    // Note: this will only be used in development when the frontend is served manually
    // You will need a backend to connect to, so configure that in ../config/config.js
    proxy: {
      '/api': `http://localhost:${process.env.API_PORT || 4000}`,
      // '/api': {
      //   target: 'http://localhost/30002',
      //   changeOrigin: true
      // }
    },
  },
})
