import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      TanStackRouterVite({ autoCodeSplitting: true }),
      viteReact(),
      tailwindcss(),
      svgr(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT || '3000'),
      host: '0.0.0.0',
      cors: true,
      allowedHosts: true,
      proxy: {
        '/ws-proxy': {
          target: 'wss://nexastack-python-backend.stage.neuralcompany.team',
          ws: true,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/ws-proxy/, ''),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: id => {
            // Create vendor chunks for major dependencies
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              if (id.includes('@tanstack/react-query')) {
                return 'tanstack-query'
              }
              if (id.includes('@tanstack/react-router')) {
                return 'tanstack-router'
              }
              if (
                id.includes('@tanstack/react-query-devtools') ||
                id.includes('@tanstack/react-router-devtools')
              ) {
                return 'tanstack-devtools'
              }
              if (
                id.includes('@mantine/core') ||
                id.includes('@mantine/hooks') ||
                id.includes('@mantine/form') ||
                id.includes('@mantine/notifications')
              ) {
                return 'mantine-core'
              }
              if (id.includes('@mantine/charts') || id.includes('recharts')) {
                return 'mantine-charts'
              }
              if (id.includes('@mantine/code-highlight')) {
                return 'mantine-code-highlight'
              }
              if (
                id.includes('@uiw/react-codemirror') ||
                id.includes('@codemirror') ||
                id.includes('@uiw/codemirror-theme-github')
              ) {
                return 'codemirror'
              }
              if (id.includes('shiki')) {
                return 'syntax-highlighting'
              }
              if (id.includes('rehype-highlight')) {
                return 'rehype-highlight'
              }
              if (
                id.includes('react-markdown') ||
                id.includes('rehype-raw') ||
                id.includes('remark-gfm')
              ) {
                return 'markdown'
              }
              if (
                id.includes('@tabler/icons-react') ||
                id.includes('lucide-react')
              ) {
                return 'icons'
              }
              if (
                id.includes('axios') ||
                id.includes('moment') ||
                id.includes('zustand') ||
                id.includes('zod')
              ) {
                return 'utilities'
              }
              if (
                id.includes('motion') ||
                id.includes('react-reflex') ||
                id.includes('react-simple-typewriter')
              ) {
                return 'ui-components'
              }
              if (id.includes('logrocket')) {
                return 'logging'
              }
              // Group all other vendor dependencies
              return 'vendor'
            }
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
