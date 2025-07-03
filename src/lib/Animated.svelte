<script lang="ts">
    import { fade } from 'svelte/transition';
    interface Props {
        update: any; // function fixPosition(node, { delay = 0, duration = 400, width = 300 }) {
        children?: import('svelte').Snippet;
    }

    let { update, children }: Props = $props();

    
    //     return {
    //         delay,
    //         duration,
    //         css: function (t) {
    //             return `height: 0px; overflow:hidden;`;
    //         },
    //     };
    // }
</script>

{#key update}
    <div class="animated" in:fade="{{ duration: 400 }}">
        {@render children?.()}
    </div>
{/key}

<style>
</style>
