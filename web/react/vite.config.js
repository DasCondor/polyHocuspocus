import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps every asset path relative, so the build works in any folder.
// fs.allow lets the dev server read ../shared/hocuspocus.css.
export default defineConfig({ base: './', server: { fs: { allow: ['..'] } }, plugins: [react()] });
