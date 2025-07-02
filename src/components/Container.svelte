<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<div class="container">
    {@render children?.()}
</div>

<style>
    .container {
        padding: 2px 16px;
        display: grid;
        align-items: start;
        overflow: hidden;
    }
</style>
