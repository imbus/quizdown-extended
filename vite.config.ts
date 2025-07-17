import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import autoprefixer from 'autoprefixer';
import { viteSingleFile } from 'vite-plugin-singlefile';
import pkg from './package.json';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        scss: {},
        postcss: {
          plugins: [autoprefixer()]
        }
      }),
    }),
    viteSingleFile()
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: Infinity,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/quizdown.ts'),
      name: 'Quizdown',
      fileName: (format) => `quizdown.${format}.js`, // 👈 output both .iife.js and .es.js
      formats: ['iife', 'es'],                       // 👈 build both formats
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      }
    }
  },
  define: {
    __NAME__: `"${pkg.name}"`,
    __VERSION__: `"${pkg.version}"`,
  }
});
