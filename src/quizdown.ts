import { mount } from 'svelte';
import App from './App.svelte';
import parseQuizdown from './lib/parser.js';
import { Config } from './lib/config.js';
import marked from './lib/customizedMarked.js';
import type { Quiz } from './quiz';
import { createShadowRoot } from './lib/shadowRootManager';
import type { HighlighterCore } from 'shiki';
import { getHighlighterInstance, registerLanguage, registerTheme } from './lib/codeBlockHighlighter';

export interface IQuizdown {
    register(extension: IQuizdownExtension): IQuizdown;
    createApp(rawQuizdown: string, node: Element, config: Config): App | void;
    parseQuizdown(rawQuizdown: string, config: Config): Quiz;
    init(config: object): void;
    getMarkedParser(): typeof marked;
    getShikiInstance(): Promise<HighlighterCore>;
    registerShikiLanguage(url: string): void;
    registerShikiTheme(url: string): void;
    listenForStats(quizdownNode: HTMLElement, eventHandler: Function): void;
}

export interface IQuizdownExtension {
    setup(quizdown: IQuizdown): void;
}

class Quizdown implements IQuizdown {
    private globalConfig: Config | null = null;

    register(extension: IQuizdownExtension): IQuizdown {
        extension.setup(this as IQuizdown);
        return this;
    }

    createApp(rawQuizdown: string, node: Element, config: Config): App | void {
        const root = createShadowRoot(node);

        try {
            const quiz = this.parseQuizdown(rawQuizdown, config);

            const app = mount(App, {
                target: root,
                intro: false,
                props: {
                    quiz,
                },
            });

            // Listen for quiz-stats event from shadow DOM and re-emit it from the host
            node.addEventListener('quiz-stats', (e: Event) => {
                const customEvent = e as CustomEvent;
                const statsEvent = new CustomEvent('quizdown-stats', {
                    detail: customEvent.detail,
                });
                node.dispatchEvent(statsEvent);
            });

            return app;
        } catch (e) {
            node.innerHTML = `${e}. App could not render. Please check your quizdown syntax.`;
        }
    }

    parseQuizdown(rawQuizdown: string, config: Config): Quiz {
        return parseQuizdown(rawQuizdown, config);
    }

    init(config: object = {}): void {
        this.globalConfig = new Config(config);

        if (this.globalConfig.startOnLoad && typeof document !== 'undefined') {
            window.addEventListener(
                'load',
                () => {
                    const nodes = document.querySelectorAll('.quizdown');
                    for (const node of nodes) {
                        this.createApp(node.innerHTML, node, this.globalConfig!);
                    }
                },
                false
            );
        }
    }

    listenForStats(quizdownNode: HTMLElement, eventHandler: Function): void {
        quizdownNode.addEventListener('quizdown-stats', (event) => {
            eventHandler((event as CustomEvent).detail);
        });
    }

    getShikiInstance(): Promise<HighlighterCore> {
        return getHighlighterInstance();
    }

    async registerShikiLanguage(url: string): Promise<void> {
        console.log("register theme");
        await registerLanguage("https://cdn.jsdelivr.net/npm/@shikijs/langs@3.8.0/dist/python.mjs");
    }

    async registerShikiTheme(url: string): Promise<void> {
        console.log("register lang");
        await registerTheme("https://cdn.jsdelivr.net/npm/@shikijs/themes@3.8.0/dist/catppuccin-latte.mjs");
    }

    onQuizCreate(callback: () => void): void {
        callback();
    }

    onQuizLoading(callback: () => void): void {
        callback();
    }

    onQuizStarted(callback: () => void): void {
        callback();
    }

    onQuestionChangeStarted(callback: () => void): void {
        callback();
    }

    onQuizFinish(callback: () => void): void {
        callback();
    }

    onQuizEvaluated(callback: () => void): void {
        callback();
    }

    getMarkedParser(): typeof marked {
        return marked;
    }
}

export default Quizdown;
