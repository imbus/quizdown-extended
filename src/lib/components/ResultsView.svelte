<script lang="ts">
    import type { Quiz } from '../quiz';
    import { _ } from 'svelte-i18n';
    import { fade } from 'svelte/transition';
    import Button from './Button.svelte';
    import passIcon from '../../assets/symbols/pass.svg?raw';
    import failIcon from '../../assets/symbols/fail.svg?raw';
    import infoIcon from '../../assets/symbols/info.svg?raw';
    import lightbulb from '../../assets/symbols/lightbulb2.svg?raw';
    import { highlightAllCodeBlocks } from '../codeBlockHighlighter';
    import { tick } from 'svelte';

    interface Props {
        quiz: Quiz;
    }

    let { quiz }: Props = $props();

    // Calculate the score
    let score = $state(0);
    let percent = $state(0);

    // Track which questions have expanded explanations
    let expandedQuestions = $state(new Set<number>());

    let tableRef: HTMLTableElement | null = null;

    async function toggleExplanation(index: number) {
        const nextSet = new Set(expandedQuestions);

        if (nextSet.has(index)) {
            nextSet.delete(index);
        } else {
            nextSet.add(index);
        }

        expandedQuestions = nextSet;
        await tick();
        await highlightAllCodeBlocks(tableRef ?? undefined);
    }

    function getSelectedAnswers(question: any) {
        if (question.selected.length === 0) {
            return [];
        }
        return question.selected.map((index: number) => {
            return question.answers[index];
        });
    }

    // Initialize score calculation
    $effect(() => {
        if (quiz) {
            score = quiz.evaluate();
            percent = Math.round((score / quiz.questions.length) * 100);

            quiz.evaluate();

            // Log questions for debugging
            /*console.log(
                'Results questions:',
                JSON.parse(JSON.stringify(quiz.questions))
            );*/
        }
    });

</script>

<div>
    <h2>{$_('quizResults')}</h2>
    <p>
        {$_('scoreText', { values: { score, total: quiz.questions.length } })}
    </p>
    <h3>{percent}%</h3>
    <table bind:this={tableRef} class="questions-review">
        <thead>
            <tr>
                <th class="id-column">#</th>
                <th>Status</th>
                <th>Question</th>
            </tr>
        </thead>
        <tbody>
            {#each quiz.questions as question, i}
                <tr class={question.isCorrect() ? 'correct' : 'incorrect'}>
                    <td class="id-column">{i + 1}.</td>
                    <td>
                        {#if question.isCorrect()}
                            <span alt="Correct" class="svg-wrap status-icon status-pass" >{@html passIcon}</span>
                        {:else}
                            <span alt="Incorrect" class="svg-wrap status-icon status-fail" >{@html failIcon}</span>
                        {/if}
                    </td>
                    <td>
                        <div class="question-cell">
                            <span class="question-text">{question.getTextWithoutHTML()}</span>
                            {#if question.selected.length > 0}
                                <Button
                                    btnClass="quizControlButton"
                                    buttonAction={() => toggleExplanation(i)}
                                    aria-label="Toggle explanation"
                                    title="Show explanation"
                                >
                                    <span class="svg-wrap status-icon status-info-small explain-icon">{@html infoIcon}</span>
                                </Button>
                            {/if}
                        </div>
                    </td>
                </tr>
                {#if expandedQuestions.has(i) && question.selected.length > 0}
                    <tr class="explanation-row">
                        <td colspan="3" class="explanation-cell">
                            <div in:fade|local="{{ duration: 400 }}" class="explanation-content">
                                {#if question.hint}
                                    <div class="answer-item hint-section">
                                        <div class="answer-header">
                                            <span class="svg-wrap status-icon answer-status-icon status-info-small hint-icon">{@html lightbulb}</span>
                                            Hint:
                                        </div>
                                        <div>{@html question.hint}</div>
                                    </div>
                                {/if}
                                <div class="selected-answers-section">
                                    <strong>Your selected answer{question.selected.length > 1 ? 's' : ''}:</strong>
                                    {#each getSelectedAnswers(question) as answer}
                                        <div class="answer-item {answer.correct ? 'answer-correct' : 'answer-incorrect'}">
                                            <div class="answer-header">
                                                <span class="answer-status">
                                                    {#if answer.correct}
                                                        <span alt="Correct" class="svg-wrap answer-status-icon status-pass" >{@html passIcon}</span>
                                                        Correct
                                                    {:else}
                                                        <span alt="Incorrect" class="svg-wrap answer-status-icon status-fail" >{@html failIcon}</span>
                                                        Incorrect
                                                    {/if}
                                                </span>
                                            </div>
                                            <div class="answer-content">
                                                {@html answer.html}
                                            </div>
                                            {#if answer.comment}
                                                <div class="answer-explanation">
                                                    <strong>Explanation:</strong>
                                                    <div>{@html answer.comment}</div>
                                                </div>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
</div>

<style>
    table.questions-review {
        width: 100%;
        border-collapse: collapse;
    }

    table.questions-review th,
    table.questions-review td {
        border: none;
        padding: 8px;
        text-align: left;
    }

    /* table.questions-review td:hover {
        filter: opacity(0.8);
    } */

    .id-column {
        width: 60px;
    }

    .question-cell {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .question-text {
        flex: 1;
    }

    :global(.explain-icon) {
        width: 14px;
        height: 14px;
        filter: var(--quizdown-icon-info-filter, none);
    }

    .explanation-row {
        background: rgba(0, 0, 0, 0.02);
    }

    .explanation-cell {
        padding: 16px 8px !important;
    }

    .explanation-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-size: 0.95em;
    }


    .hint-section .answer-header {
        display: block;
        margin-bottom: 8px;
    }

    .selected-answers-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .selected-answers-section > strong {
        display: block;
    }

    .answer-item {
        padding: 12px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .answer-item.hint-section {
        background: var(--quizdown-color-hint-bg);
        border-left: 4px solid var(--quizdown-color-hint);
    }
    .answer-item.hint-section .answer-header {
        color: var(--quizdown-color-hint);
    }

    .answer-item.answer-correct {
        background: var(--quizdown-color-pass-bg);
        border-left: 4px solid var(--quizdown-color-pass);
    }
    .answer-item.answer-correct .answer-header {
        color: var(--quizdown-color-pass);
    }

    .answer-item.answer-incorrect {
        background: var(--quizdown-color-fail-bg);
        border-left: 4px solid var(--quizdown-color-fail);
    }
    .answer-item.answer-incorrect .answer-header {
        color: var(--quizdown-color-fail);
    }

    .answer-header {
        display: flex;
        font-weight: bold;
        align-items: center;
        justify-content: space-between;
    }

    .answer-status {
        font-weight: 600;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 6px;
    }



    .answer-content {
        padding: 8px 0;
        line-height: 1.5;
    }

    .answer-explanation {
        padding: 10px;
        border-radius: 4px;
        margin-top: 4px;
    }

    .answer-explanation strong {
        display: block;
        margin-bottom: 6px;
        font-size: 0.9em;
    }


    .svg-wrap {
        fill: currentColor !important;
    }

    :global(.answer-status-icon, .status-icon) {
        width: 24px;
        height: 24px;
        display: inline-block;
        vertical-align: middle;
    }

    /* Icon color overrides using CSS variables */
    :global(.status-pass) {
        color: var(--quizdown-color-pass);
    }

    :global(.status-fail) {
        color: var(--quizdown-color-fail);
    }

    :global(.hint-icon) {
        color: var(--quizdown-color-hint);
    }

    :global(.explain-icon) {
        color: var(--quizdown-color-info);
    }
</style>