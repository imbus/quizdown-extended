import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import autoprefixer from 'autoprefixer'
import { viteSingleFile } from "vite-plugin-singlefile"
import pkg from './package.json'

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        scss: { /* you can pass includePaths, etc. */ },
        postcss: {
          plugins: [autoprefixer()]
        }
      }),
    }),
    viteSingleFile(),

  ],
  css: {
    // Enable CSS processing in Vite
    postcss: {
      plugins: [autoprefixer()]
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: Infinity, // Inline all assets
    cssCodeSplit: false,         // Include all CSS in the JS
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Bundle all modules into one
        manualChunks: undefined,
        entryFileNames: 'bundle.js' // Single JS file name
      }
    }
  },
 define: {
    __NAME__: `"${pkg.name}"`,
    __VERSION__: `"${pkg.version}"`,
  },
})