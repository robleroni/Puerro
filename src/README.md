# Puerro

All the abstractions used will be here.

## DOM

### Creating DOM Elements
```js
const $button = createDOMElement('button', { type: 'button', click: _ => console.log('Clicked')}, 'Go')
```

## Virtual Dom

### Creating Virtual DOM Elements

```javascript
const vDOM = h('div', {}, 
  h('label', {}, 'Vegetable'),
  h('input'),
);

document.body.prepend(render(vDOM));
```

### Diffing

## Rendering

2 of 8 nodes https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType

## State Managmenet

## Mounting

```javascript
const vDOM = ({ state, setState }) =>
    h("div", {},
        h("label", {}, "Vegetable"),
        h("input", { input: evt => setState({ value: evt.target.value }) }),
        h("p",     {}, state.value.length),
    );

mount(document.body, vDOM, { value: '' }, true);
```

## MVC

### Observables

```javascript
const observable = Observable('Tomato');

observable.onChange((newValue, oldValue) => console.log(newValue)) // Tomato
observable.set('Leek')                                             // Leek
```