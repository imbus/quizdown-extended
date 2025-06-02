#  APIs 
## Get the quiz stats
Add the following part somewhere:
``` javascript
const shadowHost = document.querySelector('.quizdown'); // host element
quizdown.listenForStats(shadowHost, (event) => {
	// Add your code here...
});
```
It will be called when quizdown is initialized and everytime a quiz is finished.  
You get the following: number of questions, visited, solved, right, wrong