import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;

// Sandbox-only: accept the proxied preview hostname (which rotates) and route
// HMR websockets through the public 443 entry point. Unset -> Vite defaults.
const allowedHosts = ['localhost', '127.0.0.1'];
if (previewMode && sandboxDomain) allowedHosts.push('.' + sandboxDomain);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts,
    hmr: previewMode ? { clientPort: 443, protocol: 'wss' } : undefined,
    watch: { usePolling: true, interval: 300 },
    proxy: {
      '/api': {
        target: 'http://api:8000',
        changeOrigin: true,
      },
    },
  },
});
