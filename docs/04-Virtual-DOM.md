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

The real advantage of the virtual DOM can be seen when diffing is being used to only specifically manipulate the elements which have been changed.

### Identity



## Diffing

## Testability

## Use Cases

The virtual DOM is useful when multiple elements need to be changed simultaneously or often.
Instead of directly selecting and manipulating DOM nodes, the structure of the view can be written in a more descriptive way and the access to the DOM API is getting delegated to the general implmenentation of the virtual DOM.

- bigger interactivity with more than 1 element which changes in a tree
- when contents are dynamic, -> data without saving, table -> fetching data over API - or template string?

### Advantages

- No direct DOM manipulations.
- Descreptive programming style.
- Better testability.

## Problems / Restrictions

- still no state

- focus / identity
- whitespaces
- disadvantages:




