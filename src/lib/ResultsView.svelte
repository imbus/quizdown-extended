<script lang="ts">
    import type { Quiz } from '../quiz';
    import Icon from './Icon.svelte';
    import { _ } from 'svelte-i18n';

    interface Props {
        quiz: Quiz;
    }

    let { quiz }: Props = $props();
    
    // Calculate the score
    let score = $state(0);
    let percent = $state(0);
    
    // Initialize score calculation
    $effect(() => {
        if (quiz) {
            score = quiz.evaluate();
            percent = Math.round((score / quiz.questions.length) * 100);
            
            // Log questions for debugging
            console.log("Results questions:", JSON.parse(JSON.stringify(quiz.questions)));
        }
    });
    
    // Function to safely get question text content
    function getQuestionText(question) {
        if (!question) return '';
        
        // If text is a string, return it directly
        if (typeof question.text === 'string') return question.text;
        
        // If question is an object, try to stringify it
        try {
            return JSON.stringify(question.text);
        } catch (e) {
            return 'Error displaying question';
        }
    }
</script>

<div>
    <h2>{$_('quizResults')}</h2>
    <p>{$_('scoreText', { values: { score, total: quiz.questions.length } })}</p>
    <h3>{percent}%</h3>
    <div class="questions-review">
        {#each quiz.questions as question, i}
            <div
                class="question-result {question.solved ? 'correct' : 'incorrect'}"
            >
                <div class="question-indicator">
                    {#if question.solved}
                        <Icon name="check" color="green" />
                    {:else}
                        <Icon name="times" color="red" />
                    {/if}
                </div>
                <div class="question-text">
                    <span class="question-number">{i + 1}. </span>
                    <!-- Use our safe getter function -->
                    {@html getQuestionText(question)}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    /* Styles remain the same */
</style>