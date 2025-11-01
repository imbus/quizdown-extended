<script lang="ts">
  //import { props } from 'svelte';
  import DragDropList from './DragDropList.svelte';
  import type { BaseQuestion } from '../../quiz';

  let { question = $bindable() } = $props()
</script>


<DragDropList bind:data={question} />
