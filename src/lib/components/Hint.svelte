<script lang="ts">
    import { fade } from 'svelte/transition';
    interface Props {
        show: boolean;
        hint: string;
    }

    let { show, hint }: Props = $props();
</script>

{#if show}
    <p in:fade|local="{{ duration: 400 }}" class="hint">
        💡 {@html hint}
    </p>
{/if}
