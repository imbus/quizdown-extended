<script lang="ts">
    import type { BaseQuestion, QuestionType } from '../types';
    import type { SvelteComponent } from 'svelte';

    import SequenceView from './SequenceView.svelte';
    import ChoiceView from './ChoiceView.svelte';
    import { _ } from 'svelte-i18n';

    interface Props {
        question: BaseQuestion;
        n: number;
    }

    let { question, n }: Props = $props();

    // a mapping from quiz types to svelte components
    let componentMap = {
        Sequence: SequenceView,
        MultipleChoice: ChoiceView,
        SingleChoice: ChoiceView,
    };

    const QuestionComponent = $derived(componentMap[question.questionType]);


</script>

<h3>
    {$_('questionLetter')}{n}: 
    <!-- Only use @html if question.text is actually HTML, otherwise just display the text -->
    {#if typeof question.text === 'string'}
        {@html question.text}
    {:else}
        {JSON.stringify(question.text)}
    {/if}
</h3>

{#if question.explanation}
    <p>
        {#if typeof question.explanation === 'string'}
            {@html question.explanation}
        {:else}
            {JSON.stringify(question.explanation)}
        {/if}
    </p>
{/if}

<QuestionComponent bind:question={question} />