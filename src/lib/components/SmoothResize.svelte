<script lang="ts">
    import { run } from 'svelte/legacy';

    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    interface Props {
        minHeight?: number;
        children?: import('svelte').Snippet;
    }

    let { minHeight = 0, children }: Props = $props();

    let innerHeight: number = $state(0);
    const height = tweened(0, {
        duration: 100,
    });
    let mounted = $state(false);
    onMount(() => (mounted = true));
    run(() => {
        if (mounted) {
            height.set(Math.max(minHeight, innerHeight));
        }
    });
</script>

<div style="height:{$height}px;">
    <div bind:clientHeight="{innerHeight}">
        {@render children?.()}
    </div>
</div>
