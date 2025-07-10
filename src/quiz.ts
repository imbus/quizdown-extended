import { writable, get, type Writable } from 'svelte/store';
import autoBind from 'auto-bind';
import type { Config } from './config.js';
import quizdown from './quizdown.js';

function isEqual(a1: Array<number>, a2: Array<number>): boolean {
    return JSON.stringify(a1) === JSON.stringify(a2);
}

function shuffle(array: Array<any>, n: number | undefined): Array<any> {
    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array.slice(0, n);
}

// we need to reference the classes in the svelte app despite minifaction of class names
export type QuestionType = 'MultipleChoice' | 'SingleChoice' | 'Sequence';

export abstract class BaseQuestion {
    readonly text: string;
    answers: Array<Answer>;
    readonly originalAnswers: Array<Answer>; // To preserve initial order
    readonly explanation: string;
    selected: Array<number>;
    solved: boolean;
    correct: boolean;
    readonly hint: string;
    readonly questionType: QuestionType;
    readonly options: Config;
    showHint: Writable<boolean>;
    visited: boolean;

    constructor(
        text: string,
        explanation: string,
        hint: string,
        answers: Array<Answer>,
        questionType: QuestionType,
        options: Config
    ) {
        if (answers.length === 0) {
            throw 'no answers for question provided';
        }
        this.text = text;
        this.explanation = explanation;
        this.hint = hint;
        this.solved = false;
        this.correct = false;
        this.showHint = writable(false);
        this.options = options;
        this.answers = [...answers]; // Create a mutable copy
        this.originalAnswers = [...answers]; // Create a copy to preserve original order
        this.questionType = questionType;
        this.visited = false;
        autoBind(this);
        this.reset();
    }

    enableHint() {
        this.showHint.update((val) => true);
    }

    reset() {
        this.selected = [];
        this.solved = false;
        this.visited = false;
        this.showHint.set(false);
        if (this.options.shuffleAnswers) {
            this.answers = shuffle([...this.originalAnswers], this.originalAnswers.length);
        } else {
            this.answers = [...this.originalAnswers];
        }
    }

    getTextWithoutHTML() {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.text;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    abstract isCorrect(): boolean;
}

class Blanks extends BaseQuestion {
    isCorrect() {
        let trueAnswerIds = this.answers
            .filter((answer) => answer.correct)
            .map((answer) => answer.id);
        let selectedAnswerIds = this.selected.map((i) => this.answers[i].id);
        this.solved = isEqual(trueAnswerIds.sort(), selectedAnswerIds.sort());
        return this.solved;
    }
}

class Pairs extends BaseQuestion {
    isCorrect() {
        let trueAnswerIds = this.answers
            .filter((answer) => answer.correct)
            .map((answer) => answer.id);
        let selectedAnswerIds = this.selected.map((i) => this.answers[i].id);
        this.solved = isEqual(trueAnswerIds.sort(), selectedAnswerIds.sort());
        return this.solved;
    }
}

export class Sequence extends BaseQuestion {
    constructor(
        text: string,
        explanation: string,
        hint: string,
        answers: Array<Answer>,
        options: Config
    ) {
        // always enable shuffling for sequence questions
        options.shuffleAnswers = true;
        super(text, explanation, hint, answers, 'Sequence', options);
    }

    isCorrect() {
        if (this.answers.length !== this.originalAnswers.length) return false;

        const ids1 = this.answers.map(obj => obj.id);
        const ids2 = this.originalAnswers.map(obj => obj.id);

        return ids1.every((id, index) => id === ids2[index]);

    }
}

class Choice extends BaseQuestion {
    isCorrect() {
        let trueAnswerIds = this.answers
            .filter((answer) => answer.correct)
            .map((answer) => answer.id);
        let selectedAnswerIds = this.selected.map((i) => this.answers[i].id);
        this.solved = isEqual(trueAnswerIds.sort(), selectedAnswerIds.sort());
        return this.solved;
    }
}

export class MultipleChoice extends Choice {
    constructor(
        text: string,
        explanation: string,
        hint: string,
        answers: Array<Answer>,
        options: Config
    ) {
        super(text, explanation, hint, answers, 'MultipleChoice', options);
    }
}

export class SingleChoice extends Choice {
    constructor(
        text: string,
        explanation: string,
        hint: string,
        answers: Array<Answer>,
        options: Config
    ) {
        super(text, explanation, hint, answers, 'SingleChoice', options);
        let nCorrect = this.answers.filter((answer) => answer.correct).length;
        if (nCorrect > 1) {
            throw 'Single Choice questions can not have more than one correct answer.';
        }
    }

    isCorrect(): boolean {

        // 1. Find the ID of the answer that is marked as correct.
        const correctAnswer = this.answers.find(answer => answer.correct);

        if (!correctAnswer) {
            this.solved = false;
            return false;
        }
        const correctAnswerId = correctAnswer.id;

        // 2. Find the ID of the answer the user selected.
        if (this.selected.length === 0) {
            this.solved = false;
            return false;
        }

        const selectedIndex = this.selected[0];
        const selectedAnswer = this.answers[selectedIndex];

        if (!selectedAnswer) {
            this.solved = false;
            return false;
        }
        const selectedAnswerId = selectedAnswer.id;

        // 3. Compare the two stable IDs.
        this.solved = (correctAnswerId === selectedAnswerId);
        return this.solved;
    }
}

export class Answer {
    html: string;
    correct: boolean;
    id: number;
    comment: string;

    constructor(id: number, html: string, correct: boolean, comment: string) {
        this.html = html;
        this.correct = correct;
        this.id = id;
        this.comment = comment;
        autoBind(this);
    }
}

export class Quiz {
    questions: Array<BaseQuestion>;
    active: Writable<BaseQuestion>;
    index: Writable<number>;
    config: Config;
    onLast: Writable<boolean>;
    onResults: Writable<boolean>;
    onFirst: Writable<boolean>;
    isEvaluated: Writable<boolean>;
    allVisited: Writable<boolean>;

    constructor(questions: Array<BaseQuestion>, config: Config) {
        this.index = writable(0);
        this.questions = questions;
        this.config = config;
        if (this.config.shuffleQuestions) {
            this.questions = shuffle(this.questions, this.config.nQuestions);
        }
        if (this.questions.length == 0) {
            throw 'No questions for quiz provided';
        }
        // setup first question
        this.active = writable(this.questions[0]);
        this.questions[0].visited = true;
        this.onLast = writable(this.questions.length == 1);
        this.onResults = writable(false);
        this.onFirst = writable(true);
        this.allVisited = writable(this.questions.length == 1);
        this.isEvaluated = writable(false);
        autoBind(this);
    }

    private setActive() {
        let idx = get(this.index);
        this.active.update((act) => this.questions[idx]);
        this.questions[idx].visited = true;
    }

    private checkAllVisited(): boolean {
        for (let question of this.questions) {
            if (!question.visited) {
                return false;
            }
        }
        return true;
    }

    jump(index: number): boolean {
        if (index <= this.questions.length - 1 && index >= 0) {
            // on a question
            this.index.set(index);
            this.setActive();
            this.allVisited.set(this.checkAllVisited());
            this.onResults.set(false);
            this.onLast.set(index == this.questions.length - 1);
            this.onFirst.set(index == 0);
            return true;
        } else if (index == this.questions.length) {
            // on results page
            this.onResults.set(true);
            this.onLast.set(false);
            this.index.set(index);
            return true;
        } else {
            return false;
        }
    }

    next(): boolean {
        return this.jump(get(this.index) + 1);
    }

    previous(): boolean {
        return this.jump(get(this.index) - 1);
    }

    reset(): Boolean {
        this.onLast.set(false);
        this.onResults.set(false);
        this.allVisited.set(false);
        this.isEvaluated.set(false);

        this.questions.forEach((q) => q.reset());
        if (this.config.shuffleQuestions) {
            this.questions = shuffle(this.questions, this.config.nQuestions);
        }
        return this.jump(0);
    }

    evaluate(): number {
        var points = 0;
        for (var q of this.questions) {
            if (q.isCorrect()) {
                points += 1;
                q.correct = q.isCorrect();
            }
        }
        this.isEvaluated.set(true);
        return points;
    }

    getStats(): object {
        const numberOfQuestions = this.questions.length;
        let visited = 0;
        let solved = 0;
        let wrong = 0;
        let right = 0;

        this.questions.forEach((question) => {
            if (question.visited === true) {
                visited++;
            }
            if (question.solved === true) {
                solved++;
            }
            if (question.isCorrect() === true) {
                right++;
            } else {
                wrong++;
            }
        });

        return {
            numberOfQuestions,
            visited,
            solved,
            wrong,
            right,
        }
    }
}