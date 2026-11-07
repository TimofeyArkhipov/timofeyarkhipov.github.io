import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Build goes straight into the portfolio site: works/tower-defense
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@core': dir('./src/core'),
      '@assets': dir('./src/assets'),
      '@features': dir('./src/features'),
    },
  },
  build: {
    outDir: '../../works/tower-defense',
    emptyOutDir: true,
    assetsInlineLimit: 0, // keep every sprite as a real file for the Pixi loader
  },
});
