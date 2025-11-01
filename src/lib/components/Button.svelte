<script lang="ts">
    interface Props {
        children: any;
        btnClass?: string;
        title?: string;
        disabled?: boolean;
        buttonAction: () => void;
    }


    let { children, btnClass = "", title = "", disabled = false, buttonAction }: Props = $props();
</script>

<button
    class={btnClass}
    title={title}
    disabled={disabled}
    onclick={() => buttonAction()}
>
    {@render children?.()}
</button>

<style>
    button {
        /* color: var(--quizdown-color-button); */
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
        background-color: var(--quizdown-color-button);
    }

    button:disabled {
        color: #ccc;
        cursor: not-allowed;
        opacity: 0.25;
    }

    button:disabled:hover {
        background: none;
    }
</style>