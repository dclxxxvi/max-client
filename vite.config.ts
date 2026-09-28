import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // relative base so assets resolve under /max-client/ on GitHub Pages
  base: './',
  plugins: [react()],
});
