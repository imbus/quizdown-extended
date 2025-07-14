import { createHighlighterCore, type HighlighterCore } from '@shikijs/core';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';

let globalHighlighter: HighlighterCore | null = null;
let initializationPromise: Promise<HighlighterCore> | null = null;

// Set to keep track of loaded URLs (Themes & Languages)
const loadedModules = new Set<string>();

/**
 * Get singleton highlighter instance
 */
export async function getHighlighterInstance(): Promise<HighlighterCore> {
  if (globalHighlighter) return globalHighlighter;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const wasm = await import("shiki/wasm");
      const highlighter = await createHighlighterCore({
        themes: [],
        langs: [],
        engine: createOnigurumaEngine(wasm),
      });

      globalHighlighter = highlighter;
      return highlighter;
    } catch (error) {
      console.error('Error initializing highlighter:', error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Load theme if not already loaded
 */
export async function registerTheme(url: string): Promise<void> {
  if (loadedModules.has(url)) {
    console.log(`Theme already loaded: ${url}`);
    return;
  }

  try {
    const res = await fetch(url);
    const jsText = await res.text();
    const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'application/javascript' }));
    const themeModule = await import(/* @vite-ignore */ blobUrl);

    const highlighter = await getHighlighterInstance();
    await highlighter.loadTheme(themeModule.default || themeModule);

    loadedModules.add(url);
  } catch (error) {
    console.error(`Error loading theme from ${url}:`, error);
  }
}

/**
 * Load language if not already loaded
 */
export async function registerLanguage(url: string): Promise<void> {
  if (loadedModules.has(url)) {
    console.log(`Language already loaded: ${url}`);
    return;
  }

  try {
    const res = await fetch(url);
    const jsText = await res.text();
    const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'application/javascript' }));
    const langModule = await import(/* @vite-ignore */ blobUrl);

    const highlighter = await getHighlighterInstance();
    await highlighter.loadLanguage(langModule.default || langModule);

    loadedModules.add(url);
  } catch (error) {
    console.error(`Error loading language from ${url}:`, error);
  }
}

/**
 * Highlight all code blocks
 */
export async function highlightAllCodeBlocks(
  root: ShadowRoot | Document | HTMLElement = document,
  theme: string = 'catppuccin-latte'
): Promise<void> {
  const highlighter = await getHighlighterInstance();
  const codeBlocks = root.querySelectorAll('code[class^="language-"]');

  for (const code of Array.from(codeBlocks)) {
    const langClass = Array.from(code.classList).find(cls => cls.startsWith('language-'));
    const lang = langClass?.replace('language-', '');
    if (!lang || !code.textContent) continue;

    try {
      const html = await highlighter.codeToHtml(code.textContent, { lang, theme });
      const container = document.createElement('div');
      container.innerHTML = html;
      const pre = container.querySelector('pre');
      const innerCode = pre?.querySelector('code');

      if (pre && innerCode && code.parentNode) {
        pre.innerHTML = innerCode.innerHTML;
        code.parentNode.replaceChild(pre, code);
      }
    } catch (err) {
      console.error(`Error highlighting code block (lang: ${lang}):`, err);
    }
  }
}
