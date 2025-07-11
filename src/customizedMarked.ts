import { marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js'; // Import highlight.js for syntax highlighting

// customize tokenizer to include yaml like header blocks
const tokenizer: marked.TokenizerObject = {
    // type definition does not allow custom token type
    // @ts-ignore
    hr(src) {
        const regex = RegExp(
            /^ {0,3}(-{3,}(?=[^-\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~-]* *(?:\n+|$)|$)/
        );
        const cap = regex.exec(src);
        if (cap) {
            return {
                type: 'options',
                raw: cap[0],
                data: parseYaml(cap[3], {}),
            };
        }
    },
};

// customize renderer
const renderer: marked.RendererObject = {
    paragraph(text) {
        return text;
    },
    blockquote(text) {
        return text;
    },
    heading(text) {
        return text;
    },
};

console.log(markedHighlight);
// Use marked-highlight for syntax highlighting
marked.use(
    {
        renderer: renderer,
        tokenizer: tokenizer,
    },
    /*markedHighlight({
        langPrefix: 'language-', // Add language-* classes to code blocks
        highlight(code, lang) {
            console.log(`Highlighting code: ${code}, Language: ${lang}`); // Debugging log
            return lang
                ? hljs.highlight(code, { language: lang }).value
                : hljs.highlightAuto(code).value; // Fallback to automatic highlighting
        },
    })*/
);

export default marked;