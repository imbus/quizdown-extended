<script lang="ts">
    import type { BaseQuestion } from '../types';
    
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
    
    // Debug function to inspect the answers
    function inspectAnswers() {
        if (question && question.answers) {
            console.log("Answers:", JSON.parse(JSON.stringify(question.answers)));
        }
    }
    
    // Run inspection once
    $effect(() => {
        if (question) {
            inspectAnswers();
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
    /* Styles remain the same */
</style>