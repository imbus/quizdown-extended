<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    interface Props {
        update: any; // function fixPosition(node, { delay = 0, duration = 400, width = 300 }) {
        children?: import('svelte').Snippet;
    }

    let { update, children }: Props = $props();

    const dispatch = createEventDispatcher();


    function onAnimDone() {
        dispatch('viewready');
    }

    onMount(() => {
        queueMicrotask(() => dispatch('viewready'));
    });
</script>

{#key update}
    <div class="animated" in:fade="{{ duration: 400 }}"
    onanimationend={onAnimDone}
    ontransitionend={onAnimDone}
    onintroend={onAnimDone}>
        {@render children?.()}
    </div>
{/key}

<style>
</style>
