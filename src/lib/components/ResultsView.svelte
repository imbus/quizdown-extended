<script lang="ts">
    import type { Quiz } from '../quiz';
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
    <table class="questions-review">
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
                            ✅
                        {:else}
                            ❌
                        {/if}
                    </td>
                    <td>{question.getTextWithoutHTML()}</td>
                </tr>
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

    table.questions-review td:hover {
        filter: opacity(0.8);
    }

    .id-column {
        width: 60px;
    }
</style>
