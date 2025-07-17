# Options

Options can be set globally, per quiz or per question. Options on the quiz level overwrite global options. Options on the question level overwrite quiz options.

## Setting global options

Currently, the following options are supported. Shown are the default settings:

```typescript
let config = {
    startOnLoad: true,          // detect and convert all div html elements with class quizdown
    shuffleAnswers: true,       // shuffle answers for each question
    shuffleQuestions: false,    // shuffle questions for each quiz
    nQuestions: undefined       // display n questions at random, if shuffleQuestions is true
    primaryColor: 'steelblue',  // primary CSS color
    secondaryColor: '#f2f2f2',  // secondary CSS color
    textColor: 'black',         // text color of some elements
    locale: null,               // language of the user interface (auto-detect per default)
    enableRetry: true           // allow the user to resubmit answers
};

quizdown.init(config);
```

## Language settings

If `locale: null` the language is fetched from the browser's settings.
Otherwise locale can be set globally to `en`, `fr`, `es` or `de`. 

## Setting quiz and question specific options

- Quiz and question specific options can be set inside the quizdown using YAML headers.
- Only the option `shuffleAnswers` can be used on a question level. 
- The answers for sequence questions are always shuffled.

## Shuffling

Setting `shuffleQuestions: true` will shuffle questions on every *page reload*. When clicking the reload button in the quiz app no shuffling is applied.

If shuffling is enabled, `nQuestions` can be set to a positive number. It can be used to select 
a random sample from the pool of questions. Sampling will only be applied on every *page reload*. 


Here is an example:

```
---
primaryColor: '#FF851B'
secondaryColor: '#DDDDDD'
textColor: black
locale: de
shuffleQuestions: true
nQuestions: 2
---

#### What's the value of `x[3]`?

```python
# a python list
x = [1, 2, 3, 4]
```

- [ ] 1
- [ ] 2
- [ ] 3
- [x] 4

```