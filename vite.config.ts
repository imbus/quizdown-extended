import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        scss: { /* you can pass includePaths, etc. */ },
        // if you ever use PostCSS, add it here too
      }),
    }),
  ],
})