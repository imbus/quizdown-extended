<script lang="ts">
    interface Props {
        ms: number;
        minHeight?: number;
        update?: boolean;
        children?: import('svelte').Snippet;
    }

    let { ms, minHeight = 0, update = false, children }: Props = $props();

    let node: HTMLElement | undefined = $state();

    async function wait(ms: number) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
</script>

{#key update}
    {#await wait(ms)}
        <div class="loading" bind:this={node} style="min-height:{minHeight}px;">
            <div class="spinner"></div>
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
    .spinner {
        width: 60px;
        height: 60px;
        border: 6px solid var(--quizdown-color-primary);
        border-top: 6px solid var(--quizdown-color-secondary);
        border-radius: 50%;
        animation: spin 0.3s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
