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

## Rendering

## Diffing

## Use Cases

- bigger interactivity with more than 1 element which changes in a tree$
- when contents are dynamic, -> data without saving, table -> fetching data over API - or template string?
- advantage: testable

## Problems / Restrictions

- focus / identity
- whitespaces
- disadvantages:




