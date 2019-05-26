# Virtual DOM

When the DOM was invented in 1998, websites were built and managed differently. They did not use the DOM API to constantly modify the structure of the page. Constantly updating multiple elements on a page can get very chunky, hard to maintain and even performance intensive.

This is a simple example to change a table item and adding a new row:

```html
<body>
  <table>
    <tbody>
      <tr class="row">
        <td class="item">Tomato</td>
      </tr>
    </tbody>
  </table>

  <script>
    const $tbody = document.querySelector('tbody');
    const $td = $tbody.querySelector('td');
    $td.textContent = 'Puerro';

    const $newTr = document.createElement('TR');
    $newTr.setAttribute('class', 'row');

    const $newTd = document.createElement('TD');
    $newTd.setAttribute('class', 'item');
    $newTd.textContent = 'Huerto';

    $newTr.append($newTd);
    $tbody.append($newTr);
  </script>
</body>
```
Most of the time it is easier to perform more expensive operations and updating larger parts of the DOM.
This includes the re-rendering of nodes which don't change. As seen in the last chapter, this has some disadvantages, as references and registered event listeners are getting lost. Plus it can be vulnerable for XSS attacks if the content is not being sanitized first.

```js
const $tbody = document.querySelector('tbody');
$tbody.innerHTML = `
  <tr class="row">
    <td class="item">Puerro</td>
  </tr>
  <tr class="row">
    <td class="item">Huerto</td>
  </tr>
`;
```

The virtual DOM solves this problem of needing to frequently update the DOM. It is not an official specification, but rather a new method of interfacing with the DOM. It can be thought of as a abstraction or copy of the DOM.

Basically, the virtual DOM is just a regular JavaScript object representing HTML markup. It can be manipulated freely and frequently without using the DOM API. Whenever needed, it can execute the specific changes it needs to make to the original DOM. 

Puerro has it's own implementation of the virtual DOM. [Check it out](../src/#virtual-dom).

## Creating a Virtual DOM

Since the virtual DOM is just an JavaScript objects, we can create it like this:

```js
const vDOM = {
  tagName: "tbody",
  attributes: {},
  children: [
    {
      tagName: "tr",
      attributes: { class: "row" },
      children: [
        { tagName: "td", attributes: { class: "item" }, children: ["Puerro"] }
      ]
    },
    {
      tagName: "tr",
      attributes: { class: "row" },
      children: [
        { tagName: "td", attributes: { class: "item" }, children: ["Huerto"] }
      ]
    }
  ]
};
```

Using Puerro simplifies this a lot:

```js
const vDOM = h('tbody', {},
  h('tr', { class: 'row' }, h('td', { class: 'item' }, 'Puerro')),
  h('tr', { class: 'row' }, h('td', { class: 'item' }, 'Huerto'))
);
```

> `h` stands for _hyperscript_ and is a common abbreviation for building virtual elements.

Since the virtual DOM will be modified a lot, it is a good practice to have a function to create the virtual DOM with the changing parts as parameters.

```js
const createVDOM = items => h('tbody', {}, 
  items.map(item =>  h('tr', { class: 'row' }, h('td', { class: 'item' }, item)))
);
```

### JSX



## Rendering

In order use the virtual DOM, there has to be a way to convert virtual elements into DOM nodes. Therefore, a `render` function is introduced. This function recursively travels the virtual DOM and uses the DOM API to build up nodes.

```js
// initial
const $table = document.querySelector('table');
$table.append(render(createVDOM(['Tomato'])));
```

- Using it in combination with event listeners...

```js
const handleClick = $table => event => {
  const items = ['Puerro', 'Huerto']; // items could be fetched from API's, DOM elements or others
  const vDOM = createVDOM(items);
  $table.replaceChild(render(vDOM), $table.firstElementChild);
  return vDOM;
}
```

This, however, doesn't differ a lot of using `$table.innerHTML`. All the nodes are still getting re-created from scratch and previously held references are lost.

Problems:

- Identity
- Time consuming for huge DOM tree's
- White spaces

### Identity Problem

### White-Spaces Problem

Spaces, tabs, or line breaks are all white spaces which are used to format code. In HTML markup, these white spaces are normally only for readability purposes and are not impacting the layout of a page.

However, there are exceptions. In case there are white spaces between inline elements, the are getting collapsed and displayed as a single space.

```html
<button>Puerro</button>
<button>Huerto</button>
```

The newline will be represented and displayed as a text node in the final layout. 

![with white spaces](C:/Users/Robin%20Christen/git/IP5-Puerro/docs/assets/img/with-white-spaces.png)



Without the white spaces, there is no gap between the elements.

```html
<button>Puerro</button><button>Huerto</button>
```

![without white spaces](C:/Users/Robin%20Christen/git/IP5-Puerro/docs/assets/img/without-white-spaces.png)

> How exactly white spaces are handled can be read in the [CSS Text Module Level 3 Spec](https://www.w3.org/TR/css-text-3).

=> solution: do them yourself / JSX..

## Diffing

The real advantage of the virtual DOM can be seen when diffing is being used to only specifically update the parts and elements which have been changed.

For that to work, a diffing algorithm is needed to check the changes between two virtual DOM's and applying the changes to the actual DOM. Puerro has it's own [diffing](../src/#diffing) implementation.

```js
diff($parrent, newVDOM, oldVDOM); // not used TODO
```

This implies that a _current_ or _initial_ version of the virtual DOM must exist. Since the state of this _current_ version lives in the DOM, it needs to be converted into a virtual DOM first. Puerro provides the `toVDOM` function for this purpose.

```js
const handleClick = $table => _ => {
  const vDOM = createVDOM(['Puerro', 'Huerto']);
  diff($table, vDOM, toVDOM($table.firstElementChild))
  return vDOM;
}
```

### White-Spaces Problem

Even though, most of the white spaces are not being considered for the final layout, they are still being parsed and appear in the DOM as _text nodes_.

```html
<body>
  <button>Puerro</button>
  <button>Huerto</button>
</body>
```

The `body` of the above HTML markup contains `[text, button, text, button, text]` as its `childNodes`.

This is problematic because...

## Testability

Using virtual elements results in a big benefit for testability. Instead of returning a DOM element and using the DOM API to test the content on the rendered view, the virtual DOM abstraction can be returned and tested with common JavaScript object approaches.

In case there is a specific need to test the DOM tree directly, the `render` function can be used to convert the virtual DOM into a normal DOM.

```js
describe('vDOM', test => {
  test('createVDOM', assert => {
    // given
    const items = ['Puerro', 'Huerto'];

    // when
    const vDOM = createVDOM(items);

    // then
    assert.is(vDOM.children.length, 2);
    // possibility to interact via DOM API
    assert.is(render(vDOM).querySelector('td').textContent, 'Puerro'); 
  });
});
```

## Use Cases

The virtual DOM is useful when multiple elements need to be changed simultaneously or often.
Instead of directly selecting and manipulating DOM nodes, the structure of the view can be written in a more descriptive way and the access to the DOM API is getting delegated to the general implementation of the virtual DOM.

- SPA (Single Page Applications) with huge DOM trees.
- When the DOM needs to change constantly and a lot.
- To display dynamically received content (e.g. over an API) without the need to store state.

### Advantages

- No direct DOM manipulations.
- Declarative programming style.
- Better testability.

## Problems / Restrictions

The virtual DOM is an abstraction of the DOM. Operating on the virtual DOM is in addition to the DOM manipulations, which creates a computation overhead. This is especially the case for the diffing algorithms.

As in most abstractions, simplicity comes with the price of reduced flexibility. Meaning that it is not possible to handle every single edge case scenario with the virtual DOM.

Furthermore, the virtual DOM requires to completely build up a virtual view with all its sub elements, even though most of the content might never change and could be coded directly into the HTML view.

- still accessing dom (append) on varios places?? -> state lives in view

- only fetching over API...
- The problem of using state is still not solved.
- sometimes not the same because of whitespaces

### Disadvantages

- Computation overhead.
- Reduced flexibility.
- Complicated to handle state.
- focus / identity
- no white spaces between inline elements




