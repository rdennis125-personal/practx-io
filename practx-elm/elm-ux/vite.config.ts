import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      open: false,
      cors: {
        origin: 'http://localhost:5173'
      },
      fs: {
        allow: [path.resolve(__dirname, '../../practx-swa/frontend/assets')]
      }
    },
    resolve: {
      alias: {
        '@swa-assets': path.resolve(__dirname, '../../practx-swa/frontend/assets')
      }
    },
    define: {
      'import.meta.env.VITE_ENV_NAME': JSON.stringify(env.VITE_ENV_NAME ?? 'DEV')
    }
  };
});
