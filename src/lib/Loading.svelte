<script lang="ts">
    import Icon from './Icon.svelte';

    interface Props {
        ms: number;
        minHeight?: number;
        update?: boolean;
        children?: import('svelte').Snippet;
    }

    let {
        ms,
        minHeight = 0,
        update = false,
        children
    }: Props = $props();

    let node: HTMLElement = $state();

    async function wait(ms: number) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
</script>

{#key update}
    {#await wait(ms)}
        <div
            class="loading"
            bind:this="{node}"
            style="min-height:{minHeight}px;"
        >
            <Icon name="circle-notch" spin="{true}" size="2x" />
        </div>
    {:then resolved}
        {@render children?.()}
    {/await}
{/key}

<style>
    .loading {
        vertical-align: middle;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
</style>
