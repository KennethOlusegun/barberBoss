
import { defineConfig } from 'vite';
import { resolve } from 'path';

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
    // Inclui explicitamente o pacote do Stencil/Ionic para evitar erro de resolução no WebView
    include: [
      '@stencil/core/internal/client',
    ],
    // Se você realmente precisa desabilitar, mantenha, mas geralmente "include" já resolve
    // disabled: true,
  },
  resolve: {
    alias: {
      '@stencil/core/internal/client': resolve(__dirname, 'node_modules/@stencil/core/internal/client/index.js'),
    },
  },
  cacheDir: 'node_modules/.vite-custom',
  build: {
    outDir: 'www', // Garante saída correta para Capacitor
    rollupOptions: {
      output: {
        manualChunks: undefined, // Evita code-splitting problemático
      },
    },
  },
});

// Atualizado por GitHub Copilot em 19/12/2025
import { defineConfig } from 'vite';
import { resolve } from 'path';

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
    include: [
      '@stencil/core',
      '@stencil/core/internal/client',
    ],
  },
  resolve: {
    alias: {
      '@stencil/core': resolve(__dirname, 'node_modules/@stencil/core'),
      '@stencil/core/internal/client': resolve(__dirname, 'node_modules/@stencil/core/internal/client/index.js'),
    },
  },
  cacheDir: 'node_modules/.vite-custom',
});
