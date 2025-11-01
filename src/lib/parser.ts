import DOMPurify from 'dompurify';
import stripIndent from 'strip-indent';
import {
    Quiz,
    BaseQuestion,
    MultipleChoice,
    SingleChoice,
    Sequence,
    Answer,
    type QuestionType,
} from '../quiz';
import { Config, mergeAttributes } from './config';
import marked from './customizedMarked';

function parseQuizdown(rawQuizdown: string, globalConfig: Config): Quiz {
    let tokens = tokenize(rawQuizdown);
    // globalConfig < quizConfig < questionConfig
    let quizConfig = new Config(globalConfig);

    if (hasQuizOptions(tokens)) {
        quizConfig = parseOptions(tokens, quizConfig);
    }
    let firstHeadingIdx = findFirstHeadingIdx(tokens, 0);
    const firstHeadingDepth = tokens[firstHeadingIdx]?.depth || 0;
    let questions = extractQuestions(tokens.slice(firstHeadingIdx), quizConfig, firstHeadingDepth);
    return new Quiz(questions, quizConfig);
}

function tokenize(rawQuizdown: string): marked.TokensList {
    return marked.lexer(htmlDecode(stripIndent(rawQuizdown)));
}

function hasQuizOptions(tokens: marked.TokensList) {
    // type definition does not allow custom token types
    // @ts-ignore
    let optionsIdx = tokens.findIndex((token) => token['type'] == 'options');
    let headingIdx = tokens.findIndex((token) => token['type'] == 'heading');
    // quiz options appear at the top before the first heading
    return optionsIdx !== -1 && headingIdx > optionsIdx;
}

function parseOptions(tokens: marked.Token[], quizConfig: Config): Config {
    // type definition does not allow custom token types
    // @ts-ignore
    let options = tokens.find((token) => token.type == 'options');
    return mergeAttributes(quizConfig, options['data']);
}

function extractQuestions(tokens: marked.Token[], config: Config, headingDepth = 0): BaseQuestion[] {
    let questions: BaseQuestion[] = [];
    let nextQuestion = 0;

    while (tokens.length !== 0) {
        nextQuestion = findFirstHeadingIdx(tokens.slice(1), headingDepth);
        if (nextQuestion === -1) {
            // no next question on last question
            nextQuestion = tokens.length;
        }
        let question = parseQuestion(
            tokens.splice(0, nextQuestion + 1),
            config
        );
        questions.push(question);
    }
    return questions;
}

function parseQuestion(tokens: marked.Token[], config: Config): BaseQuestion {
    let heading = parseHeading([tokens[0]]);
    let explanation = parseExplanation(tokens.slice(1));
    let hint = parseHint(tokens);
    let answers = parseAnswers(tokens);
    let questionConfig = new Config(config);
    let questionType = determineQuestionType(tokens);
    const args = [heading, explanation, hint, answers, questionConfig] as const;
    switch (questionType) {
        case 'SingleChoice':
            return new SingleChoice(...args);
        case 'MultipleChoice':
            return new MultipleChoice(...args);
        case 'Sequence':
            return new Sequence(...args);
    }
}

function findFirstHeadingIdx(tokens: marked.Token[], headingDepth: number): number {
    if (headingDepth === 0) {
        return tokens.findIndex((token) => token['type'] == 'heading');
    }
    return tokens.findIndex((token) => token['type'] == 'heading' && token['depth'] === headingDepth);
}

function parseHint(tokens: marked.Token[]): string {
    let hintTokens = tokens.filter((token) => token['type'] == 'blockquote'); //?.[0]?.tokens;
    let parsedHint = parseTokens(hintTokens);
    return parsedHint;
}

function parseExplanation(tokens: marked.Token[]): string {
    let explanations = tokens.filter(
        (token) => token['type'] == 'paragraph' || token['type'] == 'code' || token['type'] == 'heading' || token['type'] == 'table'
    );
    const parsedTokens = explanations.map(token => {
        return token.type === 'heading' ? `<h${token.depth}>${parseTokens([token])}</h${token.depth}>` : `<p>${parseTokens([token])}</p>`;
    }).join('');
    return parsedTokens;
}

function parseHeading(tokens: marked.Token[]): string {
    let headings = tokens.filter((token) => token['type'] == 'heading');
    return parseTokens(headings);
}

function parseAnswers(tokens: marked.Token[]): Array<Answer> {
    let list = tokens.find(
        (token) => token.type == 'list'
    ) as marked.Tokens.List;
    let answers: Array<Answer> = [];
    list.items.forEach(function (item, i) {
        let answer = parseAnswer(item);
        answers.push(
            new Answer(i, answer['text'], item['checked'], answer['comment'])
        );
    });
    return answers;
}

function parseAnswer(item: marked.Tokens.ListItem) {
    let commentTokens = item['tokens'].filter((token) => token.type == 'blockquote'); //?.[0]?.tokens;
    let texts = item['tokens'].filter((token) => token.type != 'blockquote');
    return { text: parseTokens(texts), comment: parseTokens(commentTokens) };
}

function determineQuestionType(tokens: marked.Token[]): QuestionType {
    let list = tokens.find(
        (token) => token.type == 'list'
    ) as marked.Tokens.List;
    if (list.ordered) {
        if (list.items[0].task) {
            return 'SingleChoice';
        } else {
            return 'Sequence';
        }
    } else {
        return 'MultipleChoice';
    }
}

// This is the key function that needs to be fixed
function parseTokens(tokens: marked.Token[]): string {
    // return DOMPurify.sanitize(marked.parser(tokens as marked.TokensList));

    if (!Array.isArray(tokens) || tokens.length === 0) {
        return '';
    }

    // Create a clone of the tokens array with a new 'links' property
    // This avoids modifying the original tokens array which might cause side effects
    const tokensWithLinks = [...tokens];
    // @ts-ignore
    tokensWithLinks.links = {};

    try {
        // Get the raw HTML output directly instead of using marked.parser
        // This skips the internal object representation that might be causing issues
        let html = '';

        // Method 1: Try using marked.parser directly but with toString to force string conversion
        const parsedResult = marked.parser(tokensWithLinks as marked.TokensList);
        html = String(parsedResult);

        // If the result is still [object Object], try alternative approaches
        if (html === '[object Object]') {
            console.error('marked.parser returned [object Object], trying alternative parsing methods.');
            // Method 2: Process each token individually and combine the results
            html = tokens.map(token => {
                // Extract text content from different token types
                if (token.type === 'paragraph' && token.text) {
                    return `<p>${token.text}</p>`;
                } else if (token.type === 'heading' && token.text) {
                    const level = token.depth || 1;
                    return `<h${level}>${token.text}</h${level}>`;
                } else if (token.type === 'code' && token.text) {
                    return `<pre><code>${token.text}</code></pre>`;
                } else if (token.type === 'blockquote' && token.text) {
                    return `<blockquote>${token.text}</blockquote>`;
                } else if (token.type === 'text' && token.text) {
                    return token.text;
                } else if (token.type === 'list' && Array.isArray(token.items)) {
                    const listItems = token.items.map(item => `<li>${item.text || ''}</li>`).join('');
                    return token.ordered ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`;
                } else if (token.type === 'codespan' && token.text) {
                    return `<code>${token.text}</code>`;
                } else if (token.type === 'em' && token.text) {
                    return `<em>${token.text}</em>`;
                } else if (token.type === 'strong' && token.text) {
                    return `<strong>${token.text}</strong>`;
                } else if (token.type === 'space') {
                    return '<br />';
                } else if (token.raw) {
                    return token.raw;
                }
                return '';
            }).join('');
        }

        return DOMPurify.sanitize(html);
    } catch (error) {
        console.error('Error parsing tokens:', error);

        // Fallback: extract text content directly from tokens
        const textContent = tokens.map(token => {
            if (token.text) return token.text;
            if (token.raw) return token.raw;
            return '';
        }).join(' ');

        return DOMPurify.sanitize(textContent);
    }
}

function htmlDecode(text: string) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

export default parseQuizdown;