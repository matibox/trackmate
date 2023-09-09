/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  envPrefix: 'NEXT_PUBLIC_',
  test: {
    environment: 'node',
    setupFiles: 'dotenv/config',
    alias: {
      '~/': fileURLToPath(new URL('./src/', import.meta.url)),
    },
  },
});
