import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// base './' keeps every asset path relative, so the build works in any folder.
// fs.allow lets the dev server read ../shared/hocuspocus.css.
export default defineConfig({ base: './', server: { fs: { allow: ['..'] } }, plugins: [vue()] });
