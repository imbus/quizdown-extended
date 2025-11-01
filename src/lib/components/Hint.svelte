<script lang="ts">
    import { tick } from 'svelte';
    import { fade } from 'svelte/transition';
    import lightbulb from '../../assets/symbols/lightbulb2.svg?raw';
    import { highlightAllCodeBlocks } from '../codeBlockHighlighter';

    interface Props {
        show: boolean;
        hint: string;
    }
    let { show, hint }: Props = $props();

    function highlightAction(node: HTMLElement) {
        let destroyed = false;
        async function run() {
            await tick();
            if (!destroyed) {
                highlightAllCodeBlocks(node);
            }
        }
        run();
        return {
            update() {
                run();
            },
            destroy() {
                destroyed = true;
            },
        };
    }
</script>

{#if show}
    <div in:fade|local={{ duration: 400 }} class="answer-item hint-section">
        <div class="answer-header">
            <span
                class="svg-wrap status-icon answer-status-icon status-info-small hint-icon"
                >{@html lightbulb}</span
            >
            Hint:
        </div>
        <div use:highlightAction>{@html hint}</div>
    </div>
{/if}

<style>
    :global(.explain-icon) {
        width: 14px;
        height: 14px;
        filter: var(--quizdown-icon-info-filter, none);
    }

    .hint-section .answer-header {
        display: block;
        margin-bottom: 8px;
    }

    .answer-item {
        padding: 12px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .answer-item.hint-section {
        background: var(--quizdown-color-hint-bg);
        border-left: 4px solid var(--quizdown-color-hint);
    }
    .answer-item.hint-section .answer-header {
        color: var(--quizdown-color-hint);
    }

    .answer-header {
        display: flex;
        font-weight: bold;
        align-items: center;
        justify-content: space-between;
    }

    .svg-wrap {
        fill: currentColor !important;
    }

    :global(.answer-status-icon, .status-icon) {
        width: 24px;
        height: 24px;
        display: inline-block;
        vertical-align: middle;
    }

    :global(.hint-icon) {
        color: var(--quizdown-color-hint);
    }
</style>
