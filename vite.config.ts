
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './', // Ensure root is the current directory
  base: '/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html',
    },
  },
  // This allows Vite to handle .tsx files in the root
  esbuild: {
    loader: 'tsx',
    include: /.*\.[tj]sx?$/,
    exclude: [],
  },
});
