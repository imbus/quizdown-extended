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

    interface Props {
        quiz: Quiz;
    }

    let { quiz }: Props = $props();
    const dispatch = createEventDispatcher();

    let enableRetry = quiz.config.enableRetry;

    registerLanguages(quiz.config.locale);

    let node: HTMLElement = $state();
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
            }
        } catch (err) {
            console.error('Reset error:', err);
        }
    }

    function showHint() {
        if (currentQuestion) {
            currentQuestion.enableHint();
            currentHintShown = true;
            dispatchHook("onShowHint");
        }
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
            node.style.setProperty(
                '--quizdown-color-secondary',
                secondaryColor
            );
            node.style.setProperty('--quizdown-color-text', textColor);
            node.style.minHeight = `${minHeight}px`;
            //dispatchStats();

            
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
        <ProgressBar value={currentIndex} max={quiz.questions.length - 1} />
        <Loading update={reloaded} ms={800} {minHeight}>
            <Container>
                <SmoothResize {minHeight}>
                    <Animated update={currentIndex}>
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
                                currentHintShown ||
                                showingResults}
                            buttonAction={showHint}>💡</Button
                        >
                    {/snippet}
                    {#snippet center()}
                        <Button
                            btnClass="quizControlButton previousButton"
                            title={$_('previous')}
                            disabled={isFirst ||
                                showingResults ||
                                evaluationDone}
                            buttonAction={goToPrevious}>⬅</Button
                        >

                        <Button
                            btnClass="quizControlButton nextButton"
                            disabled={isLast ||
                                showingResults ||
                                evaluationDone}
                            buttonAction={goToNext}
                            title={$_('next')}>⮕</Button
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
                                    ✅
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
                                >↻</Button
                            >
                        {/if}
                    {/snippet}
                </Row>

                <Credits />
            </Container>
        </Loading>
    </Card>
</div>

<style global lang="scss">
    img {
        max-height: 400px;
        border-radius: 4px;
        max-width: 100%;
        height: auto;
    }

    code {
        padding: 0 0.4rem;
        font-size: 85%;
        color: #333;
        white-space: pre-wrap;
        border-radius: 4px;
        padding: 0.2em 0.4em;
        background-color: #f8f8f8;
        font-family: Consolas, Monaco, monospace;
    }

    a {
        color: var(--quizdown-color-primary);
    }

    .quizdown-content {
        padding: 1rem;
        max-width: 900px;
        margin: auto;
    }

    .quizControlButton {
        color: blue;
    }
</style>
