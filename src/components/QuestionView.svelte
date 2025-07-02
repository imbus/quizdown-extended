<script lang="ts">
    import type { QuestionType, BaseQuestion } from '../quiz';
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
    let componentMap: Record<QuestionType, typeof SvelteComponent> = {
        Sequence: SequenceView,
        MultipleChoice: ChoiceView,
        SingleChoice: ChoiceView,
    };

    const QuestionComponent = $derived(componentMap[question.questionType]);
</script>

<h3>
    {$_('questionLetter')}{n}: {@html question.text}
</h3>

{#if question.explanation}
    <p>{@html question.explanation}</p>
{/if}

<QuestionComponent
    question={question}
/>
