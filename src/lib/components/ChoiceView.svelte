<script lang="ts">
    import type { BaseQuestion } from '../../quiz';

    interface Props {
        question: BaseQuestion;
    }

    let { question = $bindable() }: Props = $props();

    // Local state for selections
    let selectedMultiple = $state([]);
    let selectedSingle = $state(-1);

    // Initialize selections from question
    $effect(() => {
        if (question) {
            if (question.questionType === 'MultipleChoice') {
                selectedMultiple = Array.isArray(question.selected) ? [...question.selected] : [];
            } else {
                selectedSingle = Array.isArray(question.selected) && question.selected[0] !== undefined ?
                    question.selected[0] : -1;
            }
        }
    });

    // Update question's selected property when local state changes
    $effect(() => {
        if (question) {
            if (question.questionType === 'MultipleChoice') {
                question.selected = [...selectedMultiple];
            } else if (selectedSingle !== -1) {
                question.selected = [selectedSingle];
            } else {
                question.selected = [];
            }
        }
    });

    // Function to safely get answer HTML content
    function getAnswerHtml(answer) {
        if (!answer) return '';

        // If answer is a string, return it directly
        if (typeof answer === 'string') return answer;

        // If answer has an html property that's a string, return that
        if (answer.html && typeof answer.html === 'string') return answer.html;

        // If answer is an object, try to stringify it
        if (typeof answer === 'object') {
            try {
                return JSON.stringify(answer);
            } catch (e) {
                return 'Error displaying answer';
            }
        }

        // Fallback
        return String(answer);
    }
</script>

<fieldset>
    {#if question.questionType === 'MultipleChoice'}
        {#each question.answers as answer, i}
            <label>
                <input
                    type="checkbox"
                    bind:group={selectedMultiple}
                    value={i}
                    class="answerInput"
                />
                <span>
                    <!-- Handle the case where answer.html might be an object -->
                    {@html getAnswerHtml(answer)}
                </span>
            </label>
        {/each}
    {:else}
        {#each question.answers as answer, i}
            <label>
                <input
                    type="radio"
                    bind:group={selectedSingle}
                    value={i}
                    class="answerInput"
                />
                <span>
                    <!-- Handle the case where answer.html might be an object -->
                    {@html getAnswerHtml(answer)}
                </span>
            </label>
        {/each}
    {/if}
</fieldset>

<style>
    fieldset {
        border: 0;
    }

    [type='checkbox'],
    [type='radio'] {
        position: absolute;
        opacity: 0;
    }

    [type='radio'] + span {
        border-radius: 0.5em;
    }

    [type='checkbox'] + span {
        border-radius: 4px;
    }

    [type='checkbox'] + span,
    [type='radio'] + span {
        transition-duration: 0.3s;
        background-color: var(--quizdown-color-secondary);
        color: var(--quizdown-color-text);
        display: block;
        padding: 0.5rem;
        margin: 7px;
        border: 3px solid transparent;
        cursor: pointer;
    }

    [type='checkbox']:hover + span,
    [type='checkbox']:focus + span,
    [type='radio']:hover + span,
    [type='radio']:focus + span {
        filter: brightness(0.9);
    }

    [type='checkbox']:checked + span,
    [type='radio']:checked + span {
        border: 3px solid var(--quizdown-color-primary);
    }
</style>