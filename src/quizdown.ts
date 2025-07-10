import { mount } from 'svelte';
import App from './App.svelte';
import parseQuizdown from './parser.js';
import { Config } from './config.js';
import marked from './customizedMarked.js';
import type { Quiz } from './quiz';

export interface Quizdown {
    register(extension: QuizdownExtension): Quizdown;
    createApp(rawQuizdown: string, node: Element, config: Config): App;
    parseQuizdown(rawQuizdown: string, config: Config): Quiz;
    init(config: object): void;
    getMarkedParser(): typeof marked;
    listenForStats(quizdownNode: HTMLElement, eventHandler: Function): void;
}

export interface QuizdownExtension {
    setup(quizdown: Quizdown): void;
}

function register(extension: QuizdownExtension): Quizdown {
    extension.setup(this as Quizdown);
    return this as Quizdown;
}

function createApp(rawQuizdown: string, node: Element, config: Config): App {
    node.innerHTML = ''; // Clear the node content

        let root: ShadowRoot;
        if (!!node.shadowRoot) {
            //clear root if it allready exists
            root = node.shadowRoot;
            root.innerHTML = '';
        } else {
            root = node.attachShadow({ mode: 'open' });
        }

    try {
        const quiz = parseQuizdown(rawQuizdown, config);

        const app = mount(App, {
            target: root, // Directly mount into the given node
            intro: false,
            props: {
                quiz: quiz,
            },
        });

        // Listen for quiz-stats event and re-emit to parent
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


function init(config: object = {}): void {
    let globalConfig = new Config(config);
    if (globalConfig.startOnLoad) {
        if (typeof document !== 'undefined') {
            window.addEventListener(
                'load',
                function () {
                    let nodes = document.querySelectorAll('.quizdown');
                    for (let node of nodes) {
                        createApp(node.innerHTML, node, globalConfig);
                    }
                },
                false
            );
        }
    }
}

/**
 * Attaches an event listener to the given quizdownNode that listens for the 'quizdown-stats' event.
 *
 * When the 'quizdown-stats' event is emitted, the provided eventHandler is called with the event's detail.
 *
 * @param quizdownNode - The HTML element that will emit the quizdown statistics event.
 * @param eventHandler - The callback function that handles the statistics data from the event detail.
 */
function listenForStats(quizdownNode: HTMLElement, eventHandler: Function): void {
    quizdownNode.addEventListener('quizdown-stats', (event) => {
        eventHandler((event as any).detail);
    });
}

function getMarkedParser(): typeof marked {
    return marked;
}

let quizdown: Quizdown = {
    init,
    register,
    parseQuizdown,
    createApp,
    getMarkedParser,
    listenForStats,
};

export default quizdown;
