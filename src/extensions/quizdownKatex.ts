import katex from 'katex';
import type { IQuizdownExtension } from '../quizdown.js';

interface KatexToken {
    type: 'katex';
    raw: string;
    formula: string;
    displayMode: boolean;
}

const rule = RegExp(/^(\$+)([^\$]|[^\$][\s\S]*?[^\$])\1(?!\$)/);

let markedExtension = {
    name: 'katex',
    level: 'inline',
    start(src: any): number {
        let idx: number = src.match(/(\$){1,2}/)?.index;
        return idx;
    },
    tokenizer(src: string): KatexToken | undefined {
        const match: RegExpExecArray | null = rule.exec(src);
        if (match) {
            return {
                type: 'katex',
                raw: match[0],
                formula: match[2].trim(),
                displayMode: match[1] === '$$',
            };
        }
    },
    renderer(token: KatexToken) {
        return katex.renderToString(token.formula, {
            displayMode: token.displayMode,
        });
    },
};

let quizdownKatex: IQuizdownExtension = {
    setup: function (quizdown) {
        // type definition seems outdated, because this is the correct usage
        // @ts-ignore
        quizdown.getMarkedParser().use({ extensions: [markedExtension] });
    },
};

export default quizdownKatex;
