<script lang="ts">
    interface Props {
        left?: import('svelte').Snippet;
        center?: import('svelte').Snippet<[any]>;
        right?: import('svelte').Snippet;
    }

    let { left, center, right }: Props = $props();
</script>

<div class="row">
    <div class="left">
        {@render left?.()}
    </div>
    <div class="center">
        {@render center?.({ class: "center", })}
    </div>
    <div class="right">
        {@render right?.()}
    </div>
</div>

<style>
    .row {
        padding-top: 2em;
        display: flex;
    }

    .left {
        flex: 1;
        display: flex;
        justify-content: flex-start;
    }

    .center {
        display: flex;
        justify-content: center;
    }

    .right {
        flex: 1;
        display: flex;
        justify-content: flex-end;
    }
</style>
