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
            <div class="loader"></div>
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

    .loader {
        width: 50px;
        height: 50px;
        border: 5px solid var(--quizdown-color-secondary); /*  background */
        border-top: 5px solid var(--quizdown-color-primary); /* foreground */
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 100px auto; /* Center on page */
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
