import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
    watch: {
      usePolling: true,
    },
  },
  optimizeDeps: {
    disabled: true,
  },
  cacheDir: 'node_modules/.vite-custom',
});
