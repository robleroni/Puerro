# Puerro

All the abstractions used will be here.

## Creating DOM Elements
```js
const $button = createDOMElement('button', { type: 'button', click: _ => console.log('Clicked')}, 'Go')
```

## Observables

```javascript
const observable = Observable('Tomato');

observable.onChange((newValue, oldValue) => console.log(newValue)) // Tomato
observable.set('Leek')                                             // Leek
```

## Virtual Dom

```javascript
const vDOM = h('div', {}, 
  h('label', {}, 'Vegetable'),
  h('input'),
);

document.body.prepend(render(vDOM));
```

### Diffing

## Components

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
