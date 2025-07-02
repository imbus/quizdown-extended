<script lang="ts">
    import { run } from 'svelte/legacy';

    import type { Quiz } from './quiz';
    import ProgressBar from './components/ProgressBar.svelte';
    import { onMount } from 'svelte';
    import registerLanguages from './languages/i18n';
    import Card from './components/Card.svelte';
    import Credits from './components/Credits.svelte';
    import SmoothResize from './components/SmoothResize.svelte';
    import QuestionView from './components/QuestionView.svelte';
    import Row from './components/Row.svelte';
    import Button from './components/Button.svelte';
    import { _ } from 'svelte-i18n';
    import ResultsView from './components/ResultsView.svelte';
    // import { Linear, CheckFirst } from './progressModes.js';
    import Animated from './components/Animated.svelte';
    import registerIcons from './registerIcons.js';
    import Icon from './components/Icon.svelte';
    import Hint from './components/Hint.svelte';
    import { fly } from 'svelte/transition';
    import Container from './components/Container.svelte';
    import Loading from './components/Loading.svelte';
    // import Modal from './components/Modal.svelte';
    import { createEventDispatcher } from 'svelte';

    interface Props {
        quiz: Quiz;
    }

    let { quiz }: Props = $props();
    const dispatch = createEventDispatcher();

    //let game = new Linear(quiz);

    let enableRetry = quiz.config.enableRetry;

    registerLanguages(quiz.config.locale);
    registerIcons();

    let node: HTMLElement = $state();
    let minHeight = 150;
    let reloaded = $state(false);
    // let showModal = false;

    // set global options
    onMount(async () => {
        let buttonColor: string = quiz.config.buttonColor;
        let primaryColor: string = quiz.config.primaryColor;
        let secondaryColor: string = quiz.config.secondaryColor;
        let textColor: string = quiz.config.textColor;

        node.style.setProperty('--quizdown-color-button', buttonColor);
        node.style.setProperty('--quizdown-color-primary', primaryColor);
        node.style.setProperty('--quizdown-color-secondary', secondaryColor);
        node.style.setProperty('--quizdown-color-text', textColor);
        node.style.minHeight = `${minHeight}px`;
        dispatchStats();
    });


    const dispatchStats = () => {
        const event = new CustomEvent('quizdown-stats', {
            detail: quiz.getStats(),
            bubbles: true,
            composed: true, // allows it to bubble across the shadow DOM boundary
        });

        if (node) {
            node.dispatchEvent(event);
        }
    };
    // https://github.com/sveltejs/svelte/issues/4079
    let question = $derived(quiz.active);
    let showHint = $derived($question.showHint);
    let index = $derived(quiz.index);
    let onLast = $derived(quiz.onLast);
    let onFirst = $derived(quiz.onFirst);
    let onResults = $derived(quiz.onResults);
    let isEvaluated = $derived(quiz.isEvaluated);
    let allVisited = $derived(quiz.allVisited);
    run(() => {
        if ($onResults && $isEvaluated) {
            dispatchStats();
        }
    });
</script>

<div class="quizdown-content" bind:this="{node}">
    <Card>
        <ProgressBar value="{$index}" max="{quiz.questions.length - 1}" />
        <Loading update="{reloaded}" ms="{800}" {minHeight}>
            <Container>
                <SmoothResize {minHeight}>
                    <Animated update="{$index}">
                        {#if $onResults}
                            <ResultsView {quiz} />
                        {:else}
                            <QuestionView
                                question="{$question}"
                                n="{$index + 1}"
                            />
                            <Hint hint="{$question.hint}" show="{$showHint}" />
                        {/if}
                    </Animated>
                </SmoothResize>

                <!-- <Modal show="{showModal}">Are you sure?</Modal> -->

                <Row>
                    {#snippet left()}
                                        <Button
                            btnClass="quizControlButton hintButton"
                            
                            title="{$_('hint')}"
                            disabled="{!$question.hint || $showHint || $onResults}"
                            buttonAction="{$question.enableHint}"
                            ><Icon name="lightbulb" solid="{false}" /></Button
                        >
                                    {/snippet}
                    {#snippet center()}
                                    
                            <Button
                                btnClass="quizControlButton previousButton"
                                title="{$_('previous')}"
                                disabled="{$onFirst || $onResults || $isEvaluated}"
                                buttonAction="{quiz.previous}"
                                ><Icon name="arrow-left" size="lg" /></Button
                            >

                            <Button
                                btnClass="quizControlButton nextButton"
                                disabled="{$onLast || $onResults || $isEvaluated}"
                                buttonAction="{quiz.next}"
                                title="{$_('next')}"
                                ><Icon name="arrow-right" size="lg" /></Button
                            >

                            {#if $onLast || $allVisited}
                                <div in:fly="{{ x: 200, duration: 500 }}">
                                    <Button
                                        btnClass="quizControlButton checkResultsButton"
                                        disabled="{!($onLast || $allVisited) ||
                                            $onResults}"
                                        title="{$_('evaluate')}"
                                        buttonAction="{() =>
                                            quiz.jump(quiz.questions.length)}"
                                    >
                                        <Icon name="check-double" size="lg" />
                                    </Button>
                                </div>
                            {/if}
                        
                                    {/snippet}
                    {#snippet right()}
                                    
                            {#if enableRetry}
                                {#snippet right()}
                                                        <Button
                                        
                                        title="{$_('reset')}"
                                        buttonAction="{() => {
                                            reloaded = !reloaded;
                                            quiz.reset();
                                        }}"
                                        btnClass="quizControlButton retryButton"
                                        ><Icon name="redo" /></Button
                                    >
                                                    {/snippet}
                            {/if}
                        
                                    {/snippet}
                </Row>

                <Credits />
            </Container>
        </Loading>
    </Card>
</div>

<!-- global styles applied to all elements in the app -->
<style global lang="scss" >
    /*@import 'highlight.js/styles/github';
    @import 'katex/dist/katex';
    @import '@fortawesome/fontawesome-svg-core/styles';*/

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
