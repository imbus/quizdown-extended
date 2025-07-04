<script lang="ts">
    interface Props {
        btnClass?: string;
        title?: string;
        disabled?: boolean;
        buttonAction: () => void;
    }

    let { btnClass = "", title = "", disabled = false, buttonAction }: Props = $props();
</script>

<button
    class={btnClass}
    title={title}
    disabled={disabled}
    onclick={() => buttonAction()}
>
    <slot />
</button>

<style>
    button {
        color: var(--quizdown-color-button);
        background: none;
        border: 0;
        cursor: pointer;
        padding: 0.7rem;
        margin: 0.2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }

    button:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }

    button:disabled {
        color: #ccc;
        cursor: not-allowed;
    }

    button:disabled:hover {
        background: none;
    }
</style>