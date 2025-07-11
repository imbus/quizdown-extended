import { codeToHtml } from 'shiki';

export async function highlightAllCodeBlocks(theme: string = 'vitesse-dark'): Promise<void> {
  const codeElements: NodeListOf<HTMLElement> = document.querySelectorAll('code[class^="language-"]');

  console.log(document);
  console.log(codeElements);

  for (const codeEl of codeElements) {
    const classList = Array.from(codeEl.classList);
    const langClass = classList.find(cls => cls.startsWith('language-'));

    if (!langClass) continue;

    const language = langClass.replace('language-', '');
    const rawCode = codeEl.textContent || '';

    try {
      const highlightedHtml = await codeToHtml(rawCode, {
        lang: language,
        theme: theme,
        defaultColor: false,
      });

      const wrapper = document.createElement('div');
      wrapper.innerHTML = highlightedHtml;
      const highlightedElement = wrapper.querySelector('pre');

      if (highlightedElement && codeEl.parentNode) {
        codeEl.parentNode.replaceChild(highlightedElement, codeEl);
      }
    } catch (error) {
      console.error(`Error highlighting code block (lang: ${language}):`, error);
    }
  }
}
