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
} from './quiz';
import { Config, mergeAttributes } from './config';
import marked from './customizedMarked';

function parseQuizdown(rawQuizdown: string, globalConfig: Config): Quiz {
    let tokens = tokenize(rawQuizdown);
    // globalConfig < quizConfig < questionConfig
    let quizConfig = new Config(globalConfig);

    if (hasQuizOptions(tokens)) {
        quizConfig = parseOptions(tokens, quizConfig);
    }
    let firstHeadingIdx = findFirstHeadingIdx(tokens);
    let questions = extractQuestions(tokens.slice(firstHeadingIdx), quizConfig);
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

function extractQuestions(tokens: marked.Token[], config: Config) {
    let questions: BaseQuestion[] = [];
    let nextQuestion = 0;

    while (tokens.length !== 0) {
        nextQuestion = findFirstHeadingIdx(tokens.slice(1));
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
    let explanation = parseExplanation(tokens);
    let hint = parseHint(tokens);
    let heading = parseHeading(tokens);
    let answers = parseAnswers(tokens);
    let questionType = determineQuestionType(tokens);
    let questionConfig = new Config(config);
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

function findFirstHeadingIdx(tokens: marked.Token[]): number {
    return tokens.findIndex((token) => token['type'] == 'heading');
}

function parseHint(tokens: marked.Token[]): string {
    let blockquotes = tokens.filter((token) => token['type'] == 'blockquote');
    return parseTokens(blockquotes);
}

function parseExplanation(tokens: marked.Token[]): string {
    let explanations = tokens.filter(
        (token) => token['type'] == 'paragraph' || token['type'] == 'code'
    );
    return parseTokens(explanations);
}

function parseHeading(tokens: marked.Token[]): string {
    let headings = tokens.filter((token) => token['type'] == 'heading');
    return parseTokens(headings);
}

function parseAnswers(tokens: marked.Token[]): Array<Answer> {
    let list = tokens.find(
        (token) => token.type == 'list'
    ) as marked.Tokens.List;
    
    if (!list || !list.items) {
        return [];
    }
    
    let answers: Array<Answer> = [];
    list.items.forEach(function (item, i) {
        if (!item) return;
        
        let answer = parseAnswer(item);
        // Ensure text and comment are strings
        const text = typeof answer.text === 'string' ? answer.text : safeStringify(answer.text);
        const comment = typeof answer.comment === 'string' ? answer.comment : safeStringify(answer.comment);
        
        answers.push(
            new Answer(i, text, item['checked'], comment)
        );
    });
    return answers;
}

function parseAnswer(item: marked.Tokens.ListItem) {
    if (!item || !Array.isArray(item['tokens'])) {
        return { text: '', comment: '' };
    }
    
    let comments = item['tokens'].filter((token) => token.type == 'blockquote');
    let texts = item['tokens'].filter((token) => token.type != 'blockquote');
    return { 
        text: parseTokens(texts), 
        comment: parseTokens(comments) 
    };
}

function determineQuestionType(tokens: marked.Token[]): QuestionType {
    let list = tokens.find(
        (token) => token.type == 'list'
    ) as marked.Tokens.List;
    
    if (!list) {
        return 'SingleChoice'; // Default
    }
    
    if (list.ordered) {
        if (list.items && list.items[0] && list.items[0].task) {
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
    if (!Array.isArray(tokens) || tokens.length === 0) {
        return '';
    }
    
    try {
        // Check if we need to set the links property on tokens
        // Some versions of marked require this for parsing
        if (!tokens.links && Array.isArray(tokens) && tokens.length > 0) {
            // @ts-ignore
            tokens.links = {};
        }
        
        const parsed = marked.parser(tokens as marked.TokensList);
        
        // Handle all possible return types
        if (parsed === null || parsed === undefined) {
            return '';
        }
        
        if (typeof parsed === 'string') {
            return DOMPurify.sanitize(parsed);
        }
        
        // Handle object case - common with marked parser
        if (typeof parsed === 'object') {
            // Extract the raw HTML if available (some marked versions return {html: string})
            if (parsed.hasOwnProperty('html') && typeof parsed.html === 'string') {
                return DOMPurify.sanitize(parsed.html);
            }
            
            // Try to get text content if available
            if (parsed.hasOwnProperty('text') && typeof parsed.text === 'string') {
                return DOMPurify.sanitize(parsed.text);
            }
            
            // Try to get content if available
            if (parsed.hasOwnProperty('content') && typeof parsed.content === 'string') {
                return DOMPurify.sanitize(parsed.content);
            }
            
            // Use raw property if available
            if (parsed.hasOwnProperty('raw') && typeof parsed.raw === 'string') {
                return DOMPurify.sanitize(parsed.raw);
            }
            
            // If marked parser returned an array of tokens, try to extract text from them
            if (Array.isArray(parsed)) {
                const textParts = parsed.map(token => {
                    if (typeof token === 'string') return token;
                    if (token && typeof token.text === 'string') return token.text;
                    if (token && typeof token.raw === 'string') return token.raw;
                    return '';
                }).filter(Boolean);
                
                if (textParts.length > 0) {
                    return DOMPurify.sanitize(textParts.join(' '));
                }
            }
            
            // Last resort: safely convert to string
            return DOMPurify.sanitize(safeStringify(parsed));
        }
        
        // Convert any other type to string
        return DOMPurify.sanitize(String(parsed));
    } catch (error) {
        console.error('Error parsing tokens:', error);
        // Try to extract text from tokens directly as a fallback
        try {
            const textContent = extractTextFromTokens(tokens);
            return DOMPurify.sanitize(textContent);
        } catch (e) {
            return '';
        }
    }
}

// Helper function to extract text directly from tokens
function extractTextFromTokens(tokens: marked.Token[]): string {
    if (!Array.isArray(tokens) || tokens.length === 0) {
        return '';
    }
    
    return tokens.map(token => {
        if (typeof token === 'string') return token;
        
        if (token.type === 'text' && token.hasOwnProperty('text')) {
            return token.text;
        }
        
        if (token.type === 'paragraph' && token.hasOwnProperty('text')) {
            return token.text;
        }
        
        if (token.type === 'heading' && token.hasOwnProperty('text')) {
            return token.text;
        }
        
        if (token.type === 'code' && token.hasOwnProperty('text')) {
            return token.text;
        }
        
        if (token.hasOwnProperty('raw') && typeof token.raw === 'string') {
            return token.raw;
        }
        
        return '';
    }).filter(Boolean).join(' ');
}

// Safe way to convert any value to a string without [object Object]
function safeStringify(value: any): string {
    if (value === null || value === undefined) {
        return '';
    }
    
    if (typeof value === 'string') {
        return value;
    }
    
    if (typeof value === 'object') {
        try {
            // Try to use JSON.stringify first for better readability
            return JSON.stringify(value);
        } catch (e) {
            // If that fails, try to extract meaningful properties
            if (value.hasOwnProperty('toString') && typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
                return value.toString();
            }
            
            // Extract properties as a last resort
            const props = [];
            for (const key in value) {
                if (value.hasOwnProperty(key) && value[key] !== undefined) {
                    props.push(`${key}: ${typeof value[key] === 'object' ? '[object]' : value[key]}`);
                }
            }
            return props.length ? `{ ${props.join(', ')} }` : '';
        }
    }
    
    return String(value);
}

function htmlDecode(text: string) {
    return text
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

export default parseQuizdown;