# State Management

So far, the state of the application lived inside the view / the DOM and was not stored anywhere else. This might be acceptable for small applications which more or less only display data. As soon as a user is able to change and interact with data, a need arises for storing state in an organized manner. That is where state management comes into play. 

## State Inside the View

In previous chapters the state always lived inside the view and was not used further. In the following example there is a form with an `input` element, where the user can insert their name. The question which poses itself now, is how to handle and where to store this name?

```js
const setName = evt => {
	// what to do with the new name?
} 

const vDOM = h('form', { },
 	h('input', { name: 'name', onInput: setName }),
);

const render = () => {
	// handle rendering; in this case with the virtual DOM
}
```

Until now the name would have been rendered right back out to the user but what if the goal is to store it and use this data later?

## Keep it Simple

The simplest way to do state management in the frontend, is storing data in an object. Setting and retrieving state is very straight forward:

```js
const myState = { name: '' };
const setName = evt => {
	myState.name = evt.target.value;
} 
```

Although the state can now be updated, there is currently no way to get notified if it changes. The notification is imperative since the state might be used in different parts of the application. 

While this approach is simple, it is also very limited and not useful in most situations, since updates have to be done manually in each event listener function.

## Components

Especially in combination with the virtual DOM, a powerful way to manage state, is to introduce components. Each component encapsulates a part of functionality which is used in the application. The components should not only provide a way to keep state but also be able to take actions in form of rerendering if the state changes.

Puerro provides a way to mount components and provide them with state. [Check it out](../src#mount).

### Render Cycle

With each action on the state the component needs to rerender, this leads to a rendering cycle which looks like the following:

![render-cycle](./assets/img/render-cycle.png)

With the state management in place as a dependency, a new component only has to define what the initial state is and how this state gets rendered. The following example uses the abstraction Puerro provides:

```js
import { h, mount } from 'puerro';

const intialState = {
  num1: 0,
  num2: 0,
}

const component = ({ state, setState }) =>
  h('div', {},
    h('input', {
      type:  'number',
      name:  'num1',
      input: evt => setState({ num1: +evt.target.value })
    }),
    h('span', {}, '+'),
    h('input', {
      type:  'number',
      name:  'num2',
      input: evt => setState({ num2: +evt.target.value })
    }),
    h('span', { }, '= ' + (state.num1+state.num2)),
  );

mount(document.body, component, intialState);
```

Since the state is not mutated directly but set through the `setState` function, the component knows that it has to rerender. Inside the `setSate` function a few things happen:

1. The actual state object is set with the updated state.
2. The `component` function gets called with the new state.
3. The new virtual DOM from the `component` function is compared against the existing tree and updated in the DOM accordingly.

### Web Components

A new concept in frontend development are web components. Web components is a generic term to describe a range of different new technologies to create reusable custom elements. 

A custom element is created by first creating a class using the ES2015 class syntax extending a HTMLElement. The new custom element can then be registered to the document using the `CustomElementRegistry.define()` function.

These custom elements do not have a render cycle built in natively but are only used to encapsulate logic. Puerro provides a combination of state management and custom elements which results in highly reusable components. The previously used example of a simple calculator can be found in the [Puerro Examples](../examples/web-components). With the help of custom elements, the input component used is abstracted and can then be reused like a normal HTML element.

```js
class MainComponent extends PuerroElement {
  static get Selector() { return 'puerro-main' };

  constructor() {
    super({ num1: 0, num2: 0 });
  }

  render() {
    return h('div', {},
      h(PuerroInputComponent.Selector, { 
      	label: 'num1', 
      	valueChanged: evt => this.setState({ num1: +evt.detail }) 
      }),
      h('span', {}, '+'),
      h(PuerroInputComponent.Selector, { 
      	label: 'num2', 
        valueChanged: evt => this.setState({ num2: +evt.detail }) 
      }),
      h('span', {}, '= ' + (this.state.num1 + this.state.num2)),
    )
  }
}
```

As described before, for the custom elements to work they have to be defined with the `customElements` API:

```js
window.customElements.define(PuerroInputComponent.Selector, PuerroInputComponent);
window.customElements.define(MainComponent.Selector, MainComponent);
```

They can then be used like normal HTML elements with the previously defined selector.

```html
<body>
  <puerro-main></puerro-main>
</body>
```

Although not yet supported in all browsers, according to [caniuse.com](https://caniuse.com/#search=custom elements) custom elements are already supported for 86% of internet users. For all other browsers, polyfills can be used to guarantee the support.

## ID Management

If data is stored on the client side but changes have to be reflected in a persistence system (like a database) on the backend, id management becomes a difficult task. This is commonly the case for CRUD like applications. For the end user there is usually a master view in which all entries of an entity are shown and a detail view which displays and lets the user edit one selected entry. The problem which now arises is the creation of an ID. The question is, when must the ID be created?

Below are a few different approaches which can be considered.

### Create an Empty Entry

One approach is to create an empty entry on the database and then let the user update this new entry. The problem with this strategy is, that the database initially contains an invalid entry which is hard to manage if for instance database constraints are in place.

### Generate the ID on the Client-Side

Generating an ID can also be done on the client side and then sent along with the other properties of an entry to the backend. This approach works well if only one person uses the system but crumbles fast if there are multiple users. If two users create a new entry with the same database state, they will generate the same ID (if the ID is incremental and not probabilistic). This causes a conflict in the database which is hard to resolve.

### Generate the ID on First Save

Another approach is to create the entry on the database as soon as it is first saved by the user. With this approach the ID is only known after the entry is sent to the backend once. It then has to be updated with this new ID for the master view.

## Testability

Since the Puerro implementation of the state management uses the virtual DOM, the same advantages in testability apply to this chapter as well.

The described example can be found in the [Puerro Examples](../examples/vdom-state).

## Use Cases

State management becomes relevant relatively fast. As soon as data not only gets displayed but also has to be changed and stored, the need for some sort of state management arises.

Possible scenarios are:

- Applications which need to store data on the client side.
- Reactive applications which work with user interactions.

### Advantages

This list refers to the Puerro implementation of state management.

- Automatic rerendering.
- Small amount of boilerplate code.
- Unidirectional dataflow.

## Problems / Restrictions

With a managed state an application can become harder to manage and comprehend. It is important, that state is always stored in the same way to keep consistency and maintainability. This is a restriction that can be tedious for small projects.

If the state updates the UI automatically, bugs can be hard to trace through the abstractions. 

[← Virtual DOM](03-Virtual-DOM.md) | [MVC →](05-MVC.md)