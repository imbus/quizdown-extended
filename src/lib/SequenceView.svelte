<script lang="ts">
  //import { props } from 'svelte';
  import DragDropList from './DragDropList.svelte';
  import type { BaseQuestion } from '../quiz';

  const { question }: { question: BaseQuestion } = $props();
</script>


<DragDropList bind:data={question.answers} />
