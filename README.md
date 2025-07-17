# Quizdown Extended

A fork from [bonartm/quizdown-js](https://github.com/bonartm/quizdown-js) with more features.
> The Katex-extension is currently not supported

## Usage
Add a div with the class quizdown there are questions inside
``` html
    <div class="quizdown" id="quiz-container">
      ---
      shuffleAnswers: true
      shuffleQuestions: true
      nQuestions: 5
      passingGrade: 80
      customPassMsg: You have Passed!
      customFailMsg: You have not passed
      ---

      ```python
      x = [1, 2, 3, 4]
      ```

      - [ ] 1
      - [ ] 2
      - [ ] 3
      - [x] 4

    </div>
```

### ESM
> See the example in `index.html`
``` html
<script type="module">
  import Quizdown from '/src/quizdown.ts';
  import quizdownKatex from '/src/extensions/quizdownKatex.ts';
  const quizdown = new Quizdown();
  // Register extension
  quizdown.register(quizdownKatex);
 quizdown.getShikiInstance()
    .then(async (instance) => {
      await quizdown.registerShikiLanguage("");
      await quizdown.registerShikiTheme("");
    })
 window.addEventListener('load', () => {
    const host = document.getElementById('quiz-container');
    const rawQuizdown = host.innerHTML;
    const config = { startOnLoad: false };
   quizdown.createApp(rawQuizdown, host, config);
 });
</script>

```
### IIFE
> See the example in `index.dist.html.txt`
``` html
  <script type="module">
    import Quizdown from '/src/quizdown.ts';
    import quizdownKatex from '/src/extensions/quizdownKatex.ts';

    const quizdown = new Quizdown();

    quizdown.getShikiInstance()
      .then(async (instance) => {
        await quizdown.registerShikiLanguage("");
        await quizdown.registerShikiTheme("");
      })

    window.addEventListener('load', () => {
      const host = document.getElementById('quiz-container');
      const rawQuizdown = host.innerHTML;
      const config = { startOnLoad: false };

      quizdown.createApp(rawQuizdown, host, config);
    });
  </script>
```

## How to Write the Questions

See [docs/syntax.md](docs/syntax.md)

## API

### Load themes and languages

You can register as many languages as you want and one theme for the dark and one for the light mode. You can pass the url to a cdn or the object as a paramenter (an example is in the index.html).  
``` javascript
quizdown.getShikiInstance()
  .then(async (instance) => {
    console.log(instance);

    // Register languages (parameter: url to the language file. You can find them here: https://www.jsdelivr.com/package/npm/@shikijs/langs?tab=files&path=dist)
    await quizdown.registerShikiLanguage("https://cdn.jsdelivr.net/npm/@shikijs/langs@3.8.0/dist/python.mjs");
    await quizdown.registerShikiLanguage("https://cdn.jsdelivr.net/npm/@shikijs/langs@3.8.0/dist/javascript.mjs");

/*
 Registering Themes
   To register a theme, provide the following parameters:
   1. **Theme Name**: Specify the name of the theme (e.g., 'catppuccin-latte', 'github-dark', if you get it from jsdelivr it is the filename).
   2. **Theme Type**: Indicate whether the theme is 'light' or 'dark' mode.
   3. **URL**: Provide the URL of the theme file. You can find available themes and their URLs on jsdelivr at:
   https://www.jsdelivr.com/package/npm/@shikijs/themes?tab=files&path=dist
*/
    await quizdown.registerShikiTheme("catppuccin-latte", "light", "https://cdn.jsdelivr.net/npm/@shikijs/themes@3.8.0/dist/catppuccin-latte.mjs");
    await quizdown.registerShikiTheme("catppuccin-mocha", "dark", "https://cdn.jsdelivr.net/npm/@shikijs/themes@3.8.0/dist/catppuccin-mocha.mjs");
  })
```

### Hooks

Quizdown Extended provides several hooks that let you respond to quiz events.  
You can register your functions to these hooks using the exposed API:

#### Available Hooks

- `quizdown.hooks.onQuizCreate(fn)`
  - Called when the quiz is initialized and created.
  - **Signature:** `() => void`
  - **Example:**
    ```javascript
    quizdown.hooks.onQuizCreate(() => {
      console.log("Quiz created");
    });
    ```

- `quizdown.hooks.onQuizQuestionChange(fn)`
  - Called whenever the user switches to a different question.
  - **Signature:** `(info: onQuestionChangeType) => void`
  - `info` contains details about the current question, such as its index and state.
  - **Example:**
    ```javascript
    quizdown.hooks.onQuizQuestionChange((info) => {
      console.log("Current question changed:", info);
    });
    ```

- `quizdown.hooks.onQuizReset(fn)`
  - Called when the quiz is reset.
  - **Signature:** `() => void`
  - **Example:**
    ```javascript
    quizdown.hooks.onQuizReset(() => {
      alert("Quiz has been reset!");
    });
    ```

- `quizdown.hooks.onShowResults(fn)`
  - Called when quiz results are shown (before the quiz is finished).
  - **Signature:** `(stats: quizStats) => void`
  - `stats` contains statistics about the quiz (number of questions, answers, etc).
  - **Example:**
    ```javascript
    quizdown.hooks.onShowResults((stats) => {
      console.log("Results shown:", stats);
    });
    ```

- `quizdown.hooks.onQuizFinish(fn)`
  - Called when the user finishes the quiz.
  - **Signature:** `(stats: quizStats) => void`
  - `stats` contains final statistics: number of questions, solved, right, wrong, etc.
  - **Example:**
    ```javascript
    quizdown.hooks.onQuizFinish((e) => {
      document.getElementById('numberOfQuestions').innerText = "# of questions: " + e.numberOfQuestions;
      document.getElementById('visited').innerText = "Visited: " + e.visited;
      document.getElementById('solved').innerText = "Solved: " + e.solved;
      document.getElementById('right').innerText = "Right: " + e.right;
      document.getElementById('wrong').innerText = "Wrong: " + e.wrong;
    });
    ```

- `quizdown.hooks.onShowHint(fn)`
  - Called when a hint is shown to the user.
  - **Signature:** `() => void`
  - **Example:**
    ```javascript
    quizdown.hooks.onShowHint(() => {
      console.log("A hint was revealed!");
    });
    ```

You can register multiple handlers for each hook.  
For details on hook data types, see the source or type definitions.

### Options
See here: [docs/options.md](docs/options.md)

---

# Todo
- [ ] Improve doucmentation
- [ ] Refactor some parts
- [ ] Remove or reimplement the Katex-support
- [ ] Make bundle size smaller
- [ ] Put all languages except english in their own files that the user can load