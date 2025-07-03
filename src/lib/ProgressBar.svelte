<script lang="ts">
    import { run } from 'svelte/legacy';

    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    interface Props {
        value: number;
        max: number;
    }

    let { value, max }: Props = $props();

    const progress = tweened(0, {
        duration: 400,
        easing: cubicOut,
    });
    run(() => {
        progress.set(Math.min(max, value) + 0.5);
    });
    let progressPercent = $derived(String(($progress / (max + 0.5)) * 100) + '%');
</script>

<div class="progress" data-label="">
    <div class="progress-slider" style="width:{progressPercent}"></div>
</div>

<style>
    .progress {
        grid-area: auto;

        height: 0.4em;
        width: 100%;
        position: relative;
    }

    .progress .progress-slider {
        background-color: var(--quizdown-color-primary);
        height: 100%;
        display: block;
    }
</style>
