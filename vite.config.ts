import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig(async ({ mode }) => {
  const postcssConfig = path.resolve(__dirname, 'postcss.config.js')

  return {
    root: path.resolve(__dirname, 'client'),
    envDir: path.resolve(__dirname, '.'),
    css: {
      postcss: postcssConfig
    },
    base: '/',
    plugins: [
      react(),
      topLevelAwait(),
      tsconfigPaths(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
            ],

          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      hmr: {
        host: 'localhost',
        port: 24690
      }
    }
  }
})
