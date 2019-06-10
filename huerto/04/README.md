# Season 04 - Changing Input

| Implementation (Demo)            | Test Results           |
| -------------------------------- | ---------------------- |
| [04 - Changing Input](demo.html) | [Tests 04](tests.html) |

## Conversation

> > **Developer**: What do you think about the validation?
>
> > **Customer**: It's very nice! I make way less mistakes now. But since you are asking. I still from time to time make spelling errors. It would be quite handy if I could correct these once I've entered them.
>
> > **Developer**: Good point. What about other fields, like the quantity or origin?
>
> > **Customer**: I haven't thought about that! Yes of course! The best case would be that I can change all the fields. I just recently forgot to water my tomatoes because I haven't written it as a comment. I don't know if they will survive.. I might need to remove it soon. Could you add a delete functionality as well? As sad as it sounds.
>
> > **Developer**: Of course, this will complete the whole CRUD spectrum.
>
> > **Customer**: Yeah ok, you lost me.. but it sure sounds professional.

## Development Process

The form now has quite a lot of fields and its a bit of a pain to programatically fill it with values. Maybe we are at a point where abstracting the DOM could be a good idea.

### ID Management

We are at a stage in the project where the application is essentially a CRUD (Create, Read, Update, Delete) system on a single "entity". In the frontend there are a few difficulties with handling the IDs of a CRUD. 

#### Generation of a new ID

The question here is when should a new ID be generated. There are a two main approaches to this problem:

- On "Add": A new entry and with it a new ID is generated as soon as the user wants to create a new object, even before filling out the form to define the properties of the object.
- On first "Save": The new entry and ID is created when it is first saved, before the first save the object is visible to the user only through the form.

For our project we sticked to the easiest solution which in our opinion is the second option (on first "Save"). The main downside with this is that emediate synchronisation between the form and the "Master View" is not possible, since a new entry only really exists as soon as it's first saved. On the other hand this makes the whole solution simpler from a developers perspective since we don't have to worry about dirty state of an entry. Since everything going to the "persistence system" (in our case a in memory list) goes through the form and is not added directly we also prevent invalid entries in a clean and efficient way.

### Building a Form with the vDom

We abstracted the creation of HTML elements in a common way known as Virtual DOM and used it in the research folder to recreate our form with it. 
The idea is to create a tree of objects resembling the DOM and rendering this tree to the actual DOM at any given time.
Since plain objects are easier to handle than `HTMLElement`'s this makes generating HTML out of JavaScript a better experience from a developers perspective.
This approach also improves testability since the mocking of the DOM is no longer nessecary, beacause the `HTMLElement`'s are created dynamically and not as HTML markup.

We created a helper function called `h` to create a tree of VNodes which in turn can be rendered to the DOM:
```javascript
const vDom = h('div', { id: 'myDiv' }, [ h('span', {}, 'foo'), h('span', {}, 'bar') ]);
```

To render the VDOM the `render` function can be used. This function returns a `HTMLElement` which contains the whole tree defined by the VDOM:
```javascript
const $dom = render(vDom);
```

Ideally the VDOM gets rendered each time something changes which has to be represented on the website. That's why we created a small state management on top of the VDOM. This state management persists a state and rerenders the view if something within the state changes. There are two main ways in which this rerendering of the view can be done.

#### Without Diffing:

Without diffing the whole DOM tree is rendered on each change in the state. Since the implementation of the DOM is very performant the user is not restricted with this approach even if the state changes very often.

Here is an example of how rerendering without diffing works: (The orange node changed, both the red and orange nodes are rerendered)

![no_diffing](assets/img/no_diffing.png)

##### Problems:

**1. Rerendering while filling in a form**
If the whole form get's rerenderd while the user is filling it out the focus gets not set correctly by default.
This causes unexpected behavior if the user for instance tries to check a checkbox right after editing a text field:
<<GIF showing the problem>>

**2. Huge DOM trees**
This is a minor problem for most use cases, but still has to be taken into consideration.
Under [research/diffing](research/diffing) there is an example of a table with 10000 rows which is rerendered slightly different on a row-click event. We have found, that with DOM trees as big as this, without diffing the trees the performance suffers quite a bit. (Depending on system and browser between factor 1.5-2 compared with diffing)



#### With Diffing:

With diffing the idea is to find which VDOM-Nodes actually a changed and only rerender the tree from there.
Here is an example of how the rendering with diffing works: (The orange node changed, both the red and orange nodes are rerendered)

![diffing](assets/img/diffing.png)

##### Problems:

**1. VNodes which are not changed, are stuck with an old instance of the state.**

For instance if we have a button and on each click the `state.count` gets increased:

```js
const view = (state, setState) =>
  h('div', [
    h('button', { click: () => setState({ count: state.count + 1 }) }, 'Add'),
    h('span', {}, state.count),
  ]);
```

Since the button itself stays the same on each click the current diffing algorithm will not rerender the button. This causes the instance of the `state` object in the `click` event handler to be stuck on the initial state.

There are two ways we looked at to eliminate this problem:

1. Accessing the state through a getter function. This way the consumer of the state can be sure to get the latest instance.
2. Only mutate the state through actions, which get called with the latest state.

We decided to implement both strategies, because the action functions not only make sure the latest state is passed, but also, make the code more readable and mutations on the state centralised.

## Result

The final result of this chapter is a fully functional CRUD system of our vegetable garden. We created the final crud without the vDom but with pure HTML and JS. We recognized, that although this is possible we would not recommend using this approach for bigger problems than a simple CRUD. The code is already quite incomprehensible. This is mainly due to DOM manipulations being made all over the code and not in a centralized manner. This also leads to decreased testability since a large protion of the functions manipulate the DOM directly, which makes it difficult to test any single function. 

Beacause of the points mentioned before, in our estimation, one should not go further than a simple CRUD with directly manipulating the DOM.