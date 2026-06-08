import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

import tailwindcss from '@tailwindcss/vite';

// Figma requires the UI to be a single HTML file without external assets
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        ui: 'index.html',
      },
    },
  },
});
