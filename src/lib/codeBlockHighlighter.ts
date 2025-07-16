import { createHighlighterCore, type HighlighterCore } from '@shikijs/core';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma';
import { getShadowRoot } from './shadowRootManager';

let globalHighlighter: HighlighterCore | null = null;
let initializationPromise: Promise<HighlighterCore> | null = null;

type ThemeEntry = {
  url: string;
  name: string
}

// Set to keep track of loaded URLs
const loadedThemes = new Map<string, ThemeEntry>();
const loadedLanguages = new Set<string>();


// Map to track loaded theme CSS by theme name
const themeCssMap = new Map<string, string>();

/**
 * Get singleton highlighter instance
 */
export async function getHighlighterInstance(): Promise<HighlighterCore> {
  if (globalHighlighter) return globalHighlighter;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const wasm = await import('shiki/wasm');
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
export async function registerTheme(name: string, type: "light" | "dark", url: string): Promise<void> {
  if (loadedThemes.has(type)) {
    return;
  }

  try {
    const res = await fetch(url);
    const jsText = await res.text();
    const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'application/javascript' }));
    const themeModule = await import(/* @vite-ignore */ blobUrl);

    const theme = themeModule.default || themeModule;
    const highlighter = await getHighlighterInstance();
    await highlighter.loadTheme(theme);

    if (typeof theme.css === 'string') {
      const name = theme.name || url;
      themeCssMap.set(name, theme.css);
    }

    const entry: ThemeEntry = {url: url, name: name}
    loadedThemes.set(type, entry);
  } catch (error) {
    console.error(`Error loading theme from ${url}:`, error);
  }

}

/**
 * Load language if not already loaded
 */
export async function registerLanguage(url: string): Promise<void> {
  if (loadedLanguages.has(url)) {
    return;
  }

  try {
    const res = await fetch(url);
    const jsText = await res.text();
    const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'application/javascript' }));
    const langModule = await import(/* @vite-ignore */ blobUrl);

    const highlighter = await getHighlighterInstance();
    await highlighter.loadLanguage(langModule.default || langModule);

    loadedLanguages.add(url);
  } catch (error) {
    console.error(`Error loading language from ${url}:`, error);
  }
}

/**
 * Highlight all code blocks
 */
export async function highlightAllCodeBlocks(
  root: ShadowRoot | Document | HTMLElement = document,
  themes: Map<"light" | "dark", ThemeEntry> = loadedThemes
): Promise<void> {
  const highlighter = await getHighlighterInstance();
  const codeBlocks = getShadowRoot()?.querySelectorAll('code[class^="language-"]');

  // Inject theme CSS into ShadowRoot once
  if (root instanceof ShadowRoot && !root.querySelector(`style[data-shiki-theme="${theme}"]`)) {
    const css = themeCssMap.get(themes);
    if (css) {
      const style = document.createElement('style');
      style.setAttribute('data-shiki-theme', theme);
      style.textContent = css;
      root.appendChild(style);
    } else {
      console.warn(`No CSS found for theme. Make sure it was provided in registerTheme().`);
    }
  }

  for (const code of Array.from(codeBlocks)) {
    const langClass = Array.from(code.classList).find(cls => cls.startsWith('language-'));
    const lang = langClass?.replace('language-', '');
    if (!lang || !code.textContent) continue;

    try {
      const html = await highlighter.codeToHtml(code.textContent, {
        lang,
        themes: {
          light: themes.get("light").name,
          dark: themes.get("dark").name
        },
        defaultColor: 'light-dark()', 
      });
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

