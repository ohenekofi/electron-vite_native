import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('electron/main.ts'),
        formats: ['cjs'],
        fileName: () => 'main.cjs'
      },
      rollupOptions: {
        external: ['electron', 'sqlite3']
      },
      outDir: 'out/main'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('electron/preload.ts'),
        formats: ['cjs'],
        fileName: () => 'preload.cjs'
      },
      rollupOptions: {
        external: ['electron']
      },
      outDir: 'out/preload'
    }
  },
  renderer: {
    plugins: [react()],
    root: '.',
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: 'index.html'
      }
    },
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    server: {
      port: 5174,
      strictPort: true,
      host: 'localhost',
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      }
    }
  }
})