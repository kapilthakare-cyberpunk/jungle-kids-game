import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        alphabet: resolve(__dirname, 'alphabet/index.html'),
        coloring: resolve(__dirname, 'coloring/index.html'),
        counting: resolve(__dirname, 'counting/index.html'),
        memory: resolve(__dirname, 'memory/index.html'),
        puzzle: resolve(__dirname, 'puzzle/index.html'),
        rhythm: resolve(__dirname, 'rhythm/index.html'),
        shapes: resolve(__dirname, 'shapes/index.html'),
        sounds: resolve(__dirname, 'sounds/index.html'),
      },
    },
  },
  server: {
    port: 8181,
    strictPort: true,
  },
});
