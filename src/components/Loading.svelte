<script lang="ts">
    export let ms: number;
    export let minHeight = 0;

    export let update = false;

    let node: HTMLElement;

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
            ↻ Todo replace with better loading animation
        </div>
    {:then resolved}
        <slot />
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
