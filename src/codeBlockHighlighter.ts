import { codeToHtml } from 'shiki';

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
      const highlightedHtml = await codeToHtml(rawCode, {
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
