<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte'; // Make sure this is properly imported
    import { get } from 'svelte/store';
    import type { Quiz } from './quiz';
    import ProgressBar from './lib/components/ProgressBar.svelte';
    import registerLanguages from './languages/i18n';
    import { highlightAllCodeBlocks, registerTheme, registerLanguage } from './lib/codeBlockHighlighter';
    import Card from './lib/components/Card.svelte';
    import Credits from './lib/components/Credits.svelte';
    import SmoothResize from './lib/components/SmoothResize.svelte';
    import QuestionView from './lib/components/QuestionView.svelte';
    import Row from './lib/components/Row.svelte';
    import Button from './lib/components/Button.svelte';
    import { _ } from 'svelte-i18n';
    import ResultsView from './lib/components/ResultsView.svelte';
    import Animated from './lib/components/Animated.svelte';
    import Hint from './lib/components/Hint.svelte';
    import { fly } from 'svelte/transition';
    import Container from './lib/components/Container.svelte';
    import Loading from './lib/components/Loading.svelte';

    // Import SVG icons as URLs
    import lightbulbIcon from './assets/symbols/lightbulb2.svg?raw';
    import prevIcon from './assets/symbols/arrow_back.svg?raw';
    import nextIcon from './assets/symbols/arrow_forward.svg?raw';
    import passIcon from './assets/symbols/pass.svg?raw';
    import assignment_turned_in from './assets/symbols/assignment_turned_in.svg?raw';
    import replayIcon from './assets/symbols/replay.svg?raw';

    interface Props {
        quiz: Quiz;
    }

    let { quiz }: Props = $props();
    const dispatch = createEventDispatcher();

    let enableRetry = quiz.config.enableRetry;

    registerLanguages(quiz.config.locale);

    let node: HTMLElement | undefined = $state();
    let progressBarNode: HTMLElement | null | undefined = $state();
    let minHeight = 150;
    let reloaded = $state(false);

    // These are for tracking UI state changes
    let currentIndex = $state(0);
    let showingResults = $state(false);
    let isFirst = $state(true);
    let isLast = $state(quiz.questions.length === 1);
    let allQuestionsVisited = $state(quiz.questions.length === 1);
    let currentHintShown = $state(false);
    let evaluationDone = $state(false);

    // Initialize with the first question
    let currentQuestion = $state(quiz.questions[0]);

    // Function to update the UI state based on quiz state
    function updateUIState() {
        const idxValue = get(quiz.index);
        currentIndex = idxValue;
        showingResults = get(quiz.onResults);
        isFirst = get(quiz.onFirst);
        isLast = get(quiz.onLast);
        allQuestionsVisited = get(quiz.allVisited);
        evaluationDone = get(quiz.isEvaluated);

        tick()
        .then(async () => {
            await highlightAllCodeBlocks();
        });

        if (!showingResults && idxValue < quiz.questions.length) {
            currentQuestion = quiz.questions[idxValue];
            if (currentQuestion) {
                currentHintShown = get(currentQuestion.showHint);
            }
        }
    }

    // Navigation functions with improved error handling
    function goToNext() {
        try {
            if (quiz.next()) {
                updateUIState();
                dispatchHook("onQuizQuestionChange", {direction: "forward" });
                void scrollToProgressBar();
            }
        } catch (err) {
            console.error('Navigation error:', err);
        }
    }

    function goToPrevious() {
        try {
            if (quiz.previous()) {
                updateUIState();
                dispatchHook("onQuizQuestionChange", {direction: "backward" });
                void scrollToProgressBar();
            }
        } catch (err) {
            console.error('Navigation error:', err);
        }
    }

    function showResults() {
        try {
            if (quiz.jump(quiz.questions.length)) {
                // Force evaluation
                evaluationDone = true;

                dispatchHook("onShowResults", quiz.getStats());
                updateUIState();
                void scrollToProgressBar();
            }
        } catch (err) {
            console.error('Show results error:', err);
        }
    }

    function resetQuiz() {
        try {
            reloaded = !reloaded;
            if (quiz.reset()) {
                evaluationDone = false;
                dispatchHook("onQuizReset");
                updateUIState();
                void scrollToProgressBar();
            }
        } catch (err) {
            console.error('Reset error:', err);
        }
    }

    function showHint() {
        if (!currentQuestion?.hint || !currentQuestion.showHint) {
            return;
        }

        const hintStore = currentQuestion.showHint;
        const currentValue = get(hintStore);
        const nextValue = !currentValue;
        const setHint = (hintStore as { set?: (value: boolean) => void }).set;

        if (nextValue) {
            currentQuestion.enableHint?.();
        }

        if (typeof setHint === 'function') {
            setHint.call(hintStore, nextValue);
        }

        currentHintShown = nextValue;
        dispatchHook(nextValue ? 'onShowHint' : 'onHideHint');
    }

    function onShowHint() {
        updateUIState();
    }

    function onViewReady() {
        updateUIState();
    }

    // Modified dispatch stats to handle validation results
    const dispatchHook = (eventType: string, details: object | undefined = undefined) => {
        const eventDetails = {
            eventType: eventType,
            details: details
        }

        try {
            const event = new CustomEvent('quizdown-event', {
                detail: eventDetails,
                bubbles: true,
                composed: true,
            });

            if (node) {
                node.dispatchEvent(event);
            }
        } catch (err) {
            console.error('Event dispatch error:', err);
        }
    };

    function getStickyHeaderOffset(): number {
        if (typeof window === 'undefined') {
            return 0;
        }
        const selectors = [
            'nav.theme-layout-navbar.navbar--fixed-top',
            'nav[aria-label="Main"].navbar--fixed-top',
            '.navbar--fixed-top'
        ];
        const header = selectors
            .map((selector) => document.querySelector<HTMLElement>(selector))
            .find((el): el is HTMLElement => Boolean(el));
        return header?.offsetHeight ?? 0;
    }

    async function scrollToProgressBar() {
        if (typeof window === 'undefined' || !progressBarNode) {
            return;
        }
        await tick();
        const targetTop = window.scrollY + progressBarNode.getBoundingClientRect().top - getStickyHeaderOffset() - 16;
        window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
    }

    // Initialize UI state
    $effect(() => {
        updateUIState();
    });

    // Effect to handle DOM setup
    $effect(() => {
        if (node) {
            let buttonColor: string = quiz.config.buttonColor;
            let primaryColor: string = quiz.config.primaryColor;
            let secondaryColor: string = quiz.config.secondaryColor;
            let textColor: string = quiz.config.textColor;

            node.style.setProperty('--quizdown-color-button', buttonColor);
            node.style.setProperty('--quizdown-color-primary', primaryColor);
            node.style.setProperty('--quizdown-color-secondary', secondaryColor);
            node.style.setProperty('--quizdown-color-text', textColor);
            node.style.setProperty('--quizdown-color-background', quiz.config.backgroundColor);
            node.style.setProperty('--quizdown-color-hint', quiz.config.hintSymbolColor);
            node.style.setProperty('--quizdown-color-hint-bg', quiz.config.hintBgColor);
            node.style.setProperty('--quizdown-color-pass', quiz.config.passSymbolColor);
            node.style.setProperty('--quizdown-color-pass-bg', quiz.config.passBgColor);
            node.style.setProperty('--quizdown-color-fail', quiz.config.failSymbolColor);
            node.style.setProperty('--quizdown-color-fail-bg', quiz.config.failBgColor);
            node.style.setProperty('--quizdown-color-info', quiz.config.infoSymbolColor);
            node.style.setProperty('--quizdown-color-submit', quiz.config.submitSymbolColor);
            node.style.setProperty('--quizdown-color-shadow', quiz.config.shadowColor);
            node.style.setProperty('--quizdown-color-code-bg', quiz.config.codeBgColor);
            node.style.minHeight = `${minHeight}px`;
            // dispatchStats();


        }
    });

    // Effect for results tracking
    $effect(() => {
        if (showingResults && evaluationDone) {
            dispatchHook("onQuizFinish", quiz.getStats());
        }
    });
</script>

<div class="quizdown-content" bind:this={node}>
    <Card>
        <div bind:this={progressBarNode}>
            <ProgressBar value={currentIndex} max={quiz.questions.length - 1} />
        </div>
        <Loading update={reloaded} ms={800} {minHeight}>
            <Container>
                <SmoothResize {minHeight}>
                    <Animated update={currentIndex}  on:viewready={onViewReady}>
                        {#if showingResults}
                            <ResultsView {quiz} />
                        {:else if currentQuestion}
                            <QuestionView
                                question={currentQuestion}
                                n={currentIndex + 1}
                            />
                            <Hint
                                hint={currentQuestion.hint}
                                show={currentHintShown}
                            />
                        {/if}
                    </Animated>
                </SmoothResize>

                <Row>
                    {#snippet left()}
                        <Button
                            btnClass="quizControlButton hintButton"
                            title={$_('hint')}
                            disabled={!currentQuestion?.hint ||
                                showingResults}
                            buttonAction={showHint}><span class="button-icon svg-wrap" >{@html lightbulbIcon}</span></Button
                        >
                    {/snippet}
                    {#snippet center()}
                        <Button
                            btnClass="quizControlButton previousButton"
                            title={$_('previous')}
                            disabled={isFirst ||
                                showingResults ||
                                evaluationDone}
                            buttonAction={goToPrevious}><span class="button-icon svg-wrap" >{@html prevIcon}</span></Button
                        >

                        <Button
                            btnClass="quizControlButton nextButton"
                            disabled={isLast ||
                                showingResults ||
                                evaluationDone}
                            buttonAction={goToNext}
                            title={$_('next')}><span class="button-icon svg-wrap" >{@html nextIcon}</span></Button
                        >

                        {#if isLast || allQuestionsVisited}
                            <div in:fly={{ x: 200, duration: 500 }}>
                                <Button
                                    btnClass="quizControlButton checkResultsButton"
                                    disabled={!(
                                        isLast || allQuestionsVisited
                                    ) || showingResults}
                                    title={$_('evaluate')}
                                    buttonAction={showResults}
                                >
                                    <span class="button-icon svg-wrap" >{@html assignment_turned_in}</span>
                                </Button>
                            </div>
                        {/if}
                    {/snippet}
                    {#snippet right()}
                        {#if enableRetry}
                            <Button
                                title={$_('reset')}
                                buttonAction={resetQuiz}
                                btnClass="quizControlButton retryButton"
                                ><span class="button-icon svg-wrap" >{@html replayIcon}</span></Button>
                        {/if}
                    {/snippet}
                </Row>

                <Credits />
            </Container>
        </Loading>
    </Card>
</div>

<style global lang="scss">

    .quizdown-content {
        padding: 1rem;
        max-width: 900px;
        margin: auto;
    }

    .svg-wrap :where(path, circle, rect, polygon) {
        fill: currentColor !important;
    }

    :global(.button-icon) {
        width: 24px;
        height: 24px;
        display: inline-block;
        vertical-align: middle;
    }

    /* Icon color overrides using CSS variables */
    :global(.hintButton .button-icon) {
        color: var(--quizdown-color-hint);
    }

    :global(.previousButton .button-icon) {
        color: var(--quizdown-color-primary);
    }

    :global(.nextButton .button-icon) {
        color: var(--quizdown-color-primary);
    }

    :global(.checkResultsButton .button-icon) {
        color: var(--quizdown-color-submit);
    }

    :global(.retryButton .button-icon) {
        color: var(--quizdown-color-primary);
    }

    pre.shiki {
        border-radius: 0.4rem !important;
        font-family: monospace !important;
        vertical-align: middle;
        -webkit-overflow-scrolling: touch;
        padding: 0.5rem;
        background: var(--quizdown-color-code-bg) !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    }
</style>