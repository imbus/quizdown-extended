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
export async function registerTheme(name: string, type: 'light' | 'dark', url: string): Promise<void>;
export async function registerTheme(name: string, type: 'light' | 'dark', themeObject: any): Promise<void>;

// Implementation
export async function registerTheme(
  name: string,
  type: 'light' | 'dark',
  third: string | any
): Promise<void> {
  if (loadedThemes.has(type)) {
    return;
  }

  try {
    let theme: any;
    let url: string = 'inlined';

    if (typeof third === 'string') {
      // Remote URL
      url = third;
      const res = await fetch(url);
      const jsText = await res.text();
      const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'application/javascript' }));
      const themeModule = await import(/* @vite-ignore */ blobUrl);
      theme = themeModule.default || themeModule;
    } else {
      // Direct theme object
      theme = third;
    }

    const highlighter = await getHighlighterInstance();
    await highlighter.loadTheme(theme);

    if (typeof theme.css === 'string') {
      const themeName = theme.name || name;
      themeCssMap.set(themeName, theme.css);
    }

    loadedThemes.set(type, {
      url,
      name: theme.name || name
    });
  } catch (error) {
    console.error(`Error loading theme:`, error);
  }
}

/**
 * Load language if not already loaded
 */
// Overload signatures
export async function registerLanguage(url: string): Promise<void>;
export async function registerLanguage(languageObject: any): Promise<void>;

// Implementation
export async function registerLanguage(
  arg: string | any
): Promise<void> {
  try {
    let language: any;
    let key: string;

    if (typeof arg === 'string') {
      // Remote language by URL
      if (loadedLanguages.has(arg)) {
        return;
      }

      const res = await fetch(arg);
      const jsText = await res.text();
      const blobUrl = URL.createObjectURL(new Blob([jsText], { type: 'application/javascript' }));
      const langModule = await import(/* @vite-ignore */ blobUrl);
      language = langModule.default || langModule;
      key = arg;
    } else {
      // Direct language object
      language = arg;
      key = language.name || JSON.stringify(language); // fallback if no name
      if (loadedLanguages.has(key)) {
        return;
      }
    }

    const highlighter = await getHighlighterInstance();
    await highlighter.loadLanguage(language);

    loadedLanguages.add(key);
  } catch (error) {
    console.error(`Error loading language:`, error);
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

