# Puerro

See the generated [JSDoc](https://robin-fhnw.github.io/IP5-Puerro/src/jsdocs/) for the full documentation.

Puerro provides the following abstractions:

## Virtual DOM

### `createDomElement`

Simplifying creating DOM elements.

```js
const $button = createDomElement('button', { type: 'button', click: _ => console.log('Clicked')}, 'Go')
```

### `h`

Creating virtual DOM elements.

```javascript
const vDOM = h('div', {}, 
  h('button', {type: 'button' }, 'Click'),
  h('input'),
);
```

### `toVDOM`

Converting DOM elements to virtual DOM elements.

```javascript
const vDOM = toVDOM(createDomElement('button'));
```


### `render`

Rendering virtual DOM elements.

```javascript
const $dom = render(vDOM);
```

### `diff`

Applying virtual DOM differences to DOM element.

```js
diff(document.body, h('h1', {}, 'Puerro'), toVDOM(document.body.firstElementChild));
```

### `mount`

Mounting stateful virtual DOM to DOM.

```javascript
const vDOM = ({ state, setState }) =>
    h("div", {},
        h("label", {}, "Vegetable"),
        h("input", { input: evt => setState({ value: evt.target.value }) }),
        h("p",     {}, state.value.length),
    );

mount(document.body, vDOM, { value: '' }, true);
```

## Web Components

### `PuerroElement`

```javascript
class MyComponent extends PuerroElement {
  static get Selector() { return 'my-component' };
  
  constructor() {
    super({ counter: 0 });
  }

  render() {
    return h('div', {}, 
      h('button', { click: evt => this.setState({ counter: this.state.counter + 1})}, 'Increment'),
      h('output', {}, this.state.counter),
    );
  }
}

window.customElements.define(MyComponent.Selector, MyComponent);

document.body.append(createDomElement('my-component'));
```

## MVC

### `Observable`

Creating and handling observables.

```javascript
const observable = Observable('Tomato');

observable.onChange((newValue, oldValue) => console.log(newValue)); // Tomato
observable.set('Leek');                                             // Leek
```

### `ObservableList`

Creating and handling observable lists.

```javascript
const list = ObservableList([]);

list.onAdd(value => console.log(value));
list.add('Puerro');
```

### `ObservableObject`

Creating and handling observable objects.

```javascript
const object = ObservableObject({});

object.onChange (         console.log);
object.subscribe('value', console.log);

object.set({ value: 1 });
```

### `PuerroController`

Controller for rendering using the virtual DOM.

```javascript
class MyController extends PuerroController {
  increment() {
    this.state.push('counter', this.model.counter + 1);
  }
}

const model = { counter: 0 };                                          // model
const view = controller => h('outtput', {}, controller.model.counter); // view
const controller = new MyController(document.body, model, view);

controller.increment();
```

## Testing

### `describe`

```javascript
describe('TestSuite Name', test => {
  test('creatingDOMElement', assert => {
    // given
    const tagName = 'div';
    const content = 'test123';

    // when
    const $el = createDomElement(tagName, {}, content);

    // then
    assert.is($el.innerText, content);
    assert.is($el.tagName.toLowerCase(), tagName);
  });
});
```

