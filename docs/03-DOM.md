# DOM

While a browser receives an HTML source file, it starts to parse it piece by piece to construct an object representation of the document called the DOM ([Document Object Model](https://www.w3.org/DOM/)) tree. Simultaneously, the DOM is being converted into a _render tree_, which represents what eventually is being painted. The document can start being rendered and paintend in the browser before it is fully loaded. Unless it is blocked by CSS or JavaScript.

When the parser comes across CSS code, the rendering process is being blocked until the the CSS is fully parsed.
Simlar as before, the browser now constructs a CSSOM ([CSS Object Model](https://www.w3.org/TR/cssom-1/)) tree which associates the styles to each node. After parsing, a combination of the DOM and CSSOM are being used for continue creating the _render tree_.

Even though the rendering process can be blocked by CSS, the DOM is still being parsed. Unless it comes across JavaScript. When the parser reaches a `<script>` tag, the parsing stops and the script is being executed.
This is the reason that a JavaScript file needs to be placed after the appearance of a referenced element in the script.

Previously, it has been best practice to always include the `<script>` tags at the end of the document to make sure that all the elements are available and to not block the rendering and therefore painting process of the browser.

Nowadays, there are other options to avoid that JavaScript is being parser blocking:

```html
<script async src="script.js"> // Script is executed asynchronously, while the page continues the parsing
```
```html    
<script defer src="script.js"> // Script is executed when the page has finished parsing
```

## Manipulating the DOM

Basically, the DOM in an interface for HTML (and XML) documents which represents the page. It is dynamic and the browsers provide an API to read and change the content, structure, and style of the document via JavaScript.
This allows for changing parts of the website without the need of a refresh and therefore a repaint of the whole page.

JavaScript has access to the global `window` object which represents the window/tab of the browser in which the script is running. One of its property is `window.document` which serves as an entry point to the parsed DOM tree.

> Because `window` is the global object, there is no need to reference its properties (e.g. `document`) via `window`. The property name can be used directly as the script will figure out the global object at runtime. 

The `document` interface can now be used to manipulate the DOM.

As en example let's create an HTML file:

```html
<!doctype html>
<html>
 <head>
   <title>My first web page</title>
 </head>
 <body>
    <h1>Hello, world!</h1>
    <p>How are you?</p>
  </body>
</html>
```

The browser will parse this file to the following DOM:

<img src='assets/img/DOM.png' width=300px>

This DOM can now be manipulated via the `document` interface in JavaScript:

```js
const $h1 = document.querySelector('h1'); // Accessing the <h1> element
console.log($h1.textContent);             // Reading: Hello, world!
$h1.textContent = 'Hello, Puerro!';       // Manipulating

const $button = document.createElement('button'); // Creating new Element
document.body.appendChild($button);								// Changing DOM structure
```

### TextContent vs. InnerText vs. InnerHTML

There are three different ways to access the content of a DOM element.

1. **`element.textContent`**: represents the text content of a node as it is in the DOM. Therefore, it doesn't include the HTML tags but keeps the content of non visible elements. For example the content of  `<script>`or `<style>` tags.

2. **`element.innerText`**: similar to `textContent`but uses CSS knowledge and only returns visible content. This has the disadvantages that reading a value with `innerText`triggers a reflow to ensure up-to-date computed styles. This can be computationally expensive and should be avoided when possible.

3. **`element.innerHTML`**: represents the HTML source of the element. It should only be used when the intentention is to work with HTML markup. Misusing it for text is not optimal for performance and it is vulnerable to XSS attacks.

    

## Event-Driven Actions

After the HTML has been parsed, rendered and painted, the browser is usually waiting for user interactions.
For this to work the browser uses an event-driven programming model to notify the JavaScript code about what's happening on the page.

There are a lot of different events. For example, when the dom is finished with loading, clicking elements, typing on the keyboard, scrolling and many more.

In order react to an event, `Event Handlers`are used. It is a function which is being called from the browser when an event occures. 

When an event is fired, the first parameter an hanlder receives is an [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object which contains useful information and methods. The most used are:

- `target`: A reference to the target to which the event was originally dispatched.
- `type`: The name of the event.
- `stopPropagation()`: Stops the propagation of events further along in the DOM.
- `preventDefault()`: Cancels the event.

### Register Event Handler

To register an event there are three possibilities.

#### Inline Event Handlers

The most legacy but direct way is to register event handlers directly in the HTML markup.

```html
<button onclick="handleEvent();"></button>
```

But especially for larger projects this is considered a bad practice as it is hard to read and maintain because it doesn't separate the view from the actions. It also requires that the functions are exposed globally, which is pollution to the global namespace.

#### DOM on-Event Handlers

A better way is to register the event handlers in the JavaScript code. It is simmilar to the inline event handlers but it repects the seperation of concerns and the scope is more controllable. 

```js
$button.onclick = event => console.log('Button clicked');
```

A drawback with this approach is that it is only possible to assign one listener to each event.

#### Using `addEventListener()`

The most moden approach ist to use the `element.addEventListener()` function. It allows to register as many event handlers as needed.

```js
$button.addEventListener('click', event => console.log('Button clicked'))
```

With this approach it is also possible ro remove listeners with the `element.removeEventListener()`function.
Another advantage is the ability to choose between event bubbling and capturing.

### Bubbling and Capturing

When nodes are encapsulated, a user interaction can trigger multiple events.
Two different models exist to handle this:

- **Bubbling** (default): The event propagates from the clicked item up to all its parents, starting from the nearest one.
- **Capturing**: The outer event handlers are fired before the more specific handler.

With the following example, the events bubble. Meaning they are propagated upwards.

```html
<body>
  <div>
    <button>Click Me!</button>
  </div>
  
  <script>
    const $div    = document.querySelector('div');
    const $button = document.querySelector('button');

    $div   .addEventListener('click', _ => console.log('DIV clicked'));
    $button.addEventListener('click', _ => console.log('BUTTON clicked'));
    
    // Console Output:
    // BUTTON clicked
    // DIV clicked
  </script>
</body>
```

In order to make sure that the DIV event listeners triggers first, the methods `useCapture`parameter needs to be true.
All the event handlers with `useCapture` enabled run first (top down), afterwards the bubbling handlers (bottom up).

```js
$div.addEventListener('click', _ => console.log('DIV clicked'), true);
```

To complete stop the propagation, the handler can call the `stopPropagation()` method on the event object.

```js
$button.addEventListener('click', event => {
  console.log('BUTTON clicked');
  event.stopPropagation();
});
```







The DOM (Document Object Model) is the interface be

- what is dom -> browser API -> for reactivity
- how to intereact with dom
- event listeners
- inner html

-

* when to use:
  - prototyping, small projects with informative sites with small interactivity, slideshow, no data in client,
* advantages/disadvantages
* advantages: 0 dependencies
* disadvantage: very specific, redundant code, bad readability, complex to describe
* restrictions: difficult to scale,
