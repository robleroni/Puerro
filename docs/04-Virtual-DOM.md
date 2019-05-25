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

### JSX



## Rendering

In order use the virtual DOM, there has to be a way to convert virtual elements into DOM nodes. Therefore, a `render` function is introuduced. This function recursively travels the virtual DOM and uses the DOM API to build up nodes.

```js
const $tbody = render(vDOM);
$table.append($tbody);
```

This, however, doesn't differ a lot of using `$table.innerHTML`. All the nodes are still getting re-created from scratch and previously held references are lost.

### Identity Problem



## Diffing

The real advantage of the virtual DOM can be seen when diffing is being used to only specifically manipulate the elements which have been changed.

- toH

## Testability

Using virtual elements has a big benefit for testability. Instead of returning a DOM element and using the DOM API to test the content, the virtual DOM abstraction can be returned and tested with common JavaScript object approaches.

In case there is a specific need to test the DOM tree directly, the `render` function can be used to convert the virtual DOM into a normal DOM.

```js
const createVDOM = items => h('tbody', {}, 
  items.map(item =>  h('tr', { class: 'row' }, h('td', { class: 'item' }, item)))
);
```

Since the returned element is no longer a DOM but a virtual DOM element, it is possible to test the logic without the need to interact with the rendered view.

```js
test('createVDOM', assert => {
  // given
  const items = ['Puerro', 'Huerto'];

  // when
  const vDOM = createVDOM(items);

  // then
  assert.is(vDOM.children.length, 2);
  assert.is(render(vDOM).children.length, 2); // possibility to interact via DOM API 
});
```

## Use Cases

The virtual DOM is useful when multiple elements need to be changed simultaneously or often.
Instead of directly selecting and manipulating DOM nodes, the structure of the view can be written in a more descriptive way and the access to the DOM API is getting delegated to the general implementation of the virtual DOM.

- SPA (Single Page Applications) with huge DOM trees.
- When the DOM needs to change constantly and a lot.
- To display dynamically received content (e.g. over an API) without the need to store/update it.

### Advantages

- No direct DOM manipulations.
- Declarative programming style.
- Better testability.

## Problems / Restrictions

The virtual DOM is an abstraction of the DOM. Operating on the virtual DOM is in addition to the DOM manipulations, which creates a computation overhead. This is especially the case for the diffing algorithms.

As in most abstractions, simplicity comes with the price of reduced flexibility. Meaning that it is not possible to handle every single edge case scenario with the virtual DOM.

Furthermore, the virtual DOM requires to completely build up a virtual view with all its sub elements, even though most of the content might never change.

- only fetching over API...
- The problem of using state is still not solved.

### Disadvantages

- Computation overhead.
- Reduced flexibility.
- still no state
- focus / identity
- whitespaces




