import { mount } from 'svelte';
import App from './App.svelte';
import parseQuizdown from './lib/parser.js';
import { Config } from './lib/config.js';
import marked from './lib/customizedMarked.js';
import type { Quiz } from './quiz';
import { createShadowRoot, type ShadowRootOptions } from './lib/shadowRootManager';
import type { HighlighterCore } from 'shiki';
import { getHighlighterInstance, registerLanguage, registerTheme } from './lib/codeBlockHighlighter';
import { QuizdownHooks } from './quizdownHooks';

export interface IQuizdown {
    register(extension: IQuizdownExtension): IQuizdown;
    createApp(rawQuizdown: string, node: Element, config: Config): App | void;
    parseQuizdown(rawQuizdown: string, config: Config): Quiz;
    init(config: object): void;
    getMarkedParser(): typeof marked;
    getShikiInstance(): Promise<HighlighterCore>;
    registerShikiLanguage(url: string): void;
    registerShikiTheme(name: string, type: "light" | "dark", url: string): void;
}

export interface IQuizdownExtension {
    setup(quizdown: IQuizdown): void;
}

class Quizdown implements IQuizdown {
    private globalConfig: Config | null = null;
    public hooks: QuizdownHooks = new QuizdownHooks();
    private hookTrigger = this.hooks.getInternalAPI();


    register(extension: IQuizdownExtension): IQuizdown {
        extension.setup(this as IQuizdown);
        return this;
    }

    createApp(rawQuizdown: string, node: Element, config: Config): App | void {
        const root = createShadowRoot(node, {
            fontFamily: config.fontFamily,
            fontFamilyHeading: config.fontFamilyHeading,
            fontUrl: config.fontUrl,
            customStyles: config.customStyles
        });

        try {
            const quiz = this.parseQuizdown(rawQuizdown, config);

            const app = mount(App, {
                target: root,
                intro: false,
                props: {
                    quiz,
                },
            });

            node.addEventListener('quizdown-event', (e: Event) => {
                switch (e.detail.eventType) {
                    case "onQuizQuestionChange":
                        this.hookTrigger.triggerQuizQuestionChange(e.detail.details);
                        break;
                    case "onQuizReset":
                        this.hookTrigger.triggerQuizReset();
                        break;
                    case "onShowResults":
                        this.hookTrigger.triggerShowResults(e.detail.details);
                        break;
                    case "onQuizFinish":
                        this.hookTrigger.triggerQuizFinish(e.detail.details);
                        break;
                    case "onShowHint":
                        this.hookTrigger.triggerShowHint();
                        break;
                    default:
                        console.error("Unkown event");
                        break;
                }
            });

            this.hookTrigger.triggerCreate();

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

    getShikiInstance(): Promise<HighlighterCore> {
        return getHighlighterInstance();
    }

    // Overloads
    async registerShikiLanguage(url: string): Promise<void>;
    async registerShikiLanguage(languageObject: any): Promise<void>;

    // Implementation
    async registerShikiLanguage(arg: string | any): Promise<void> {
        await registerLanguage(arg);
    }

    async registerShikiTheme(name: string, type: "light" | "dark", url: string): Promise<void>;
    async registerShikiTheme(name: string, type: "light" | "dark", themeObject: any): Promise<void>;


    async registerShikiTheme(
        name: string,
        type: "light" | "dark",
        third: string | any
    ): Promise<void> {
        await registerTheme(name, type, third);
    }

    getMarkedParser(): typeof marked {
        return marked;
    }
}

export default Quizdown;