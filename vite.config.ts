import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import autoprefixer from 'autoprefixer'

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
  ],
  css: {
    // Enable CSS processing in Vite
    postcss: {
      plugins: [autoprefixer()]
    }
  }
})