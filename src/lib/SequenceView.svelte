<script lang="ts">
    import { run } from 'svelte/legacy';

    import DragDropList from './DragDropList.svelte';
    import type { BaseQuestion } from '../quiz';
    interface Props {
        question: BaseQuestion;
    }

    let { question = $bindable() }: Props = $props();

    run(() => {
        question.selected = question.answers.map((answer) => answer.id);
    });
</script>

<DragDropList bind:data="{question.answers}" />
