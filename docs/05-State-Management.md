# State Management

So far, the state of the application lived inside the view / the DOM and was not stored anywhere else. This might be ok for small applications which more or less only display data. As soon as a user is able to change and interact with data a need arises for storing state in an organized manner. That is where state management comes into play. 

## State inside the view

In previous chapters the state alway lived inside the view and was not used further. In the following example we have a from with an `input` element, where the user can insert their name. The question now is how to handle this name?

```js
const setName = evt => {
		// what to do with the new name?
} 

const vDOM = h('form', { },
 		h('input', { name: 'name', onInput: setName }),
);

const render = () => {
		// handle rendering; in this case with the VDOM
}
```

Until now the name would have been rendered right back out to the user but what if we want to store it and use this data later on?

## Keep it simple

The simplest way to do state management in the frontend, is storing data in an object. Setting and retreiving state is very straight forward:

```js
const myState = { name: '' };
const setName = evt => {
		myState.name = evt.target.value;
} 
```

Although the state can now be updated, there is currently no way to get notified if it changes. The notification is imperative since the state might be used in different parts of the application. 

This means while this approach is simple it is also very limited and not very useful in most situations, since updates have to be done manually in each event listener function.

## Components

Especially in combination with the vDOM a powerful way to manage state, is to introduce components. The components should not only provide a way to keep state but also be able to take actions in form of rerendering if the state changes.

Puerro provides a way to mount components and provide them with state. [Check it out](../src#components).

### Render Cycle

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
3. The new vDOM from the `component` function is compared against the existing tree and updated in the DOM accordingly.

## Testabilty

## Use Cases

State management becomes relevant pretty quickly

##Problems / Restrictions

### Disadvantages




- what is
- render cycle
- id mgmgt
- immutability
- stateless vs stateful

advantages: 
- reusability

when to use:
- one pagers with data stored in frotend

