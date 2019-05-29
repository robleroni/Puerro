# Puerro

Puerro provides the following abstractions
TODO: See the generated jsdoc for full specifications..

## `createDomElement`

In order to simplify creating DOM elements.

Usage: tagName, attributes, innerHTML
(Parameters, output)..

```js
const $button = createDomElement('button', { type: 'button', click: _ => console.log('Clicked')}, 'Go')
```

## `vNode` / `h`

In order to create virtual DOM elements...

```javascript
const vDOM = h('div', {}, 
  h('button', {type: 'button' }, 'Click'),
  h('input'),
);
```

## `render`

In order to render virtual DOM elements...

2 of 8 nodes https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType

```javascript
const $dom = render(vDOM);
```

## `diff`


## `mount`

```javascript
const vDOM = ({ state, setState }) =>
    h("div", {},
        h("label", {}, "Vegetable"),
        h("input", { input: evt => setState({ value: evt.target.value }) }),
        h("p",     {}, state.value.length),
    );

mount(document.body, vDOM, { value: '' }, true);
```

## `Observable`

```javascript
const observable = Observable('Tomato');

observable.onChange((newValue, oldValue) => console.log(newValue)) // Tomato
observable.set('Leek')                                             // Leek
```

...