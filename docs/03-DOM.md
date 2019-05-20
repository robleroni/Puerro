# DOM

While a browser receives an HTML source file, it starts to parse it piece by piece to construct an object representation of the document called the DOM ([Document Object Model](https://www.w3.org/DOM/)) tree. Simultaneously, the DOM is being converted into a _render tree_, which represents what eventually is being painted. The document can be rendered and paintend in the browser before it is fully loaded. Unless it is blocked by CSS or JavaScript.

When the parser comes across CSS code, the rendering process gets blocked until the the CSS is fully parsed.
Simlar as before, the browser now constructs a CSSOM ([CSS Object Model](https://www.w3.org/TR/cssom-1/)) tree which associates the styles to each node. After parsing, a combination of the DOM and CSSOM are being used for creating the _render tree_.

Even though the rendering process can be blocked by CSS, the DOM is still being parsed. Unless it comes across JavaScript. When the parser reaches a `<script>` tag, the parsing stops and the script is being executed.
This is the reason that a JavaScript file needs to be placed after the appearance of a referenced element in the script.

Previously, it has been a best practice to always include the `<script>` tags at the end of the document to make sure that all the elements are available and to not block the rendering and therefore painting process of the browser.

Nowadays, there are other options to avoid that JavaScript is being parser blocking:

```js
<script async src="script.js"> // Script is executed asynchronously, while the page continues the parsing
<script defer src="script.js"> // Script is executed when the page has finished parsing
```





The DOM (Document Object Model) is the interface be

- what is dom -> browser API -> for reactivity
- how to intereact with dom
- event listeners
- inner html

- 



- when to use:
  -  prototyping, small projects with informative sites with small interactivity, slideshow, no data in client, 
- advantages/disadvantages
- advantages: 0 dependencies
- disadvantage: very specific, redundant code, bad readability, complex to describe
- restrictions: difficult to scale, 

