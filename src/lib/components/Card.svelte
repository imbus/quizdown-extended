<script lang="ts">
    let { children } = $props();
</script>

<div class="card">
    {@render children?.()}
</div>

<style>
    .card {
        box-shadow: 0 4px 8px 0 var(--quizdown-color-shadow);
        background-color: var(--quizdown-color-background);
        border-radius: 0 0 4px 4px;
    }
</style>
