import { defineConfig } from 'vite';

export default defineConfig({
  base: '/goit-js-hw-11/',
  root: 'src',
  build: {
    outDir: '../dist',
    sourcemap: true,
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: true
  }
});
