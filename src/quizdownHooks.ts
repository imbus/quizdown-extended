export type onQuestionChangeType = {
    direction: "forward" | "backward";
};

export type quizStats = {
    numberOfQuestions: number;
    visited: number;
    solved: number;
    wrong: number;
    right: number;
};

export class QuizdownHooks {
    private onQuizCreateHook: Array<() => void> = [];
    private onQuizQuestionChangeHook: Array<(info: onQuestionChangeType) => void> = [];
    private onQuizResetHook: Array<() => void> = [];
    private onShowResultsHook: Array<(stats: quizStats) => void> = [];
    private onQuizFinishHook: Array<(stats: quizStats) => void> = [];
    private onShowHintHook: Array<() => void> = [];

    // Public: allow external registration of callbacks
    public onQuizCreate(callback: () => void): void {
        this.onQuizCreateHook.push(callback);
    }

    public onQuizQuestionChange(callback: (info: onQuestionChangeType) => void): void {
        this.onQuizQuestionChangeHook.push(callback);
    }

    public onQuizReset(callback: () => void): void {
        this.onQuizResetHook.push(callback);
    }

    public onShowResults(callback: (stats: quizStats) => void): void {
        this.onShowResultsHook.push(callback);
    }

    public onQuizFinish(callback: (stats: quizStats) => void): void {
        this.onQuizFinishHook.push(callback);
    }

    public onShowHint(callback: () => void): void {
        this.onShowHintHook.push(callback);
    }

    // Private: triggers only usable internally
    private callOnQuizCreate(): void {
        this.onQuizCreateHook.forEach(callback => callback());
    }

    private callOnQuizQuestionChange(info: onQuestionChangeType): void {
        this.onQuizQuestionChangeHook.forEach(callback => callback(info));
    }

    private callOnQuizReset(): void {
        this.onQuizResetHook.forEach(callback => callback());
    }

    private callOnShowResults(stats: quizStats): void {
        this.onShowResultsHook.forEach(callback => callback(stats));
    }

    private callOnQuizFinish(stats: quizStats): void {
        this.onQuizFinishHook.forEach(callback => callback(stats));
    }

    private callOnShowHint(): void {
        this.onShowHintHook.forEach(callback => callback());
    }

    // Optional: Internal control object to expose safely from another class
    public getInternalAPI() {
        return {
            triggerCreate: () => this.callOnQuizCreate(),
            triggerQuizQuestionChange: (info: onQuestionChangeType) => this.callOnQuizQuestionChange(info),
            triggerQuizReset: () => this.callOnQuizReset(),
            triggerShowResults: (stats: quizStats) => this.callOnShowResults(stats),
            triggerQuizFinish: (stats: quizStats) => this.callOnQuizFinish(stats),
            triggerShowHint: () => this.callOnShowHint(),
        };
    }
}
