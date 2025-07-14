import { createHighlighter } from 'shiki';
import { createHighlighterCore } from '@shikijs/core';
import { createOnigurumaEngine } from '@shikijs/engine-oniguruma'
//import nord from "@shikijs/themes/dist/nord.mjs";

/**
 * Highlights all <code class="language-xxx"> blocks by replacing them
 * with a <pre> tag containing Shiki-highlighted code.
 *
 * Automatically scopes to Shadow DOM if running inside one.
 *
 * @param root - Optional root (ShadowRoot or HTMLElement). If not provided, autodetected.
 * @param theme - Shiki theme to use (default: 'catppuccin-latte')
 */

export async function highlightAllCodeBlocks(
  root?: ShadowRoot | HTMLElement,
  theme: string = 'catppuccin-latte'
): Promise<void> {
  // Auto-detect root if not provided
  if (!root) {
    const script = document.currentScript as HTMLElement | null;

    // Attempt to find closest root node
    if (script) {
      const parent = script.parentElement;
      if (parent) {
        const detectedRoot = parent.getRootNode();
        if (detectedRoot instanceof ShadowRoot || detectedRoot instanceof DocumentFragment) {
          root = detectedRoot as ShadowRoot;
        } else {
          root = document;
        }
      } else {
        root = document;
      }
    } else {
      root = document;
    }
  }

  const codeElements: NodeListOf<HTMLElement> = root.querySelectorAll('code[class^="language-"]');

  for (const codeEl of codeElements) {
    const langClass = Array.from(codeEl.classList).find(cls => cls.startsWith('language-'));
    if (!langClass) continue;

    const language = langClass.replace('language-', '');
    const rawCode = codeEl.textContent || '';

    try {
      const highlightedHtml = await createShiki().codeToHtml(rawCode, {
        lang: language,
        theme: theme,
      });

      const wrapper = document.createElement('div');
      wrapper.innerHTML = highlightedHtml;

      const pre = wrapper.querySelector('pre');
      const innerCode = pre?.querySelector('code');

      if (pre && innerCode && codeEl.parentNode) {
        pre.innerHTML = innerCode.innerHTML;
        codeEl.parentNode.replaceChild(pre, codeEl);
      }
    } catch (error) {
      console.error(`Error highlighting code block (lang: ${language}):`, error);
    }
  }
}

async function createShiki() {
  const highlighter = await createHighlighterCore({
    themes: [
      // instead of strings, you need to pass the imported module
      nord,
      // or a dynamic import if you want to do chunk splitting
      //import('@shikijs/themes/material-theme-ocean')
    ],
    langs: [
      import('@shikijs/langs/javascript'),
      // shiki will try to interop the module with the default export
      () => import('@shikijs/langs/css'),
      // or a getter that returns custom grammar
      async () => JSON.parse(await fs.readFile('my-grammar.json', 'utf-8'))
    ],
    // `shiki/wasm` contains the wasm binary inlined as base64 string.
    engine: createOnigurumaEngine(import('shiki/wasm'))
  });
  return highlighter;
}