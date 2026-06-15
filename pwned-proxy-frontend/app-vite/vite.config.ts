import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all addresses (port-forwarding works)
    port: 5173,
    watch: { usePolling: true }, // make auto-reload work inside Docker
  },
});
