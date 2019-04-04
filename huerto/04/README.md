# Season 04 - Changing Input

| Implementation (Demo)            | Test Results           |
| -------------------------------- | ---------------------- |
| [04 - Changing Input](demo.html) | [Tests 05](tests.html) |

## Conversation

> > **Developer**: What do you think about the validation?
>
> > **Customer**: It's very nice! I make way less mistakes now. But since you are asking. I still from time to time make spelling errors. It would be quite handy if I could correct these once I've entered them.
>
> > **Developer**: Good point. What about other fields, like the quantity or origin?
>
> > **Customer**: I haven't thought about that! Yes of course! The best case would be that I can change all the fields. I just recently forgot to water my tomatoes because I haven't written it as a comment. I don't know if they will survive.. I might need to remove it soon. Could you add a delete functionality as well? As sad as it sounds.
>
> > **Developer**: Of course, this will complete the whole CRUD spectrum. I'll add a vegetable counter for you as well!
>
> > **Customer**: Yeah ok, you lost me.. but it sure sounds professional. But I like the counter idea.

## Development Process

The form now has quite a lot of fields and its a bit of a pain to programatically fill it with values. Maybe we are at a point where abstracting the DOM could be a good idea.

### ID Management

### Building Form with vDom

#### With Diffing:

Problems:

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

There are two ways  we looked at to eliminate this problem:

1. Accessing the state through a getter function. This way the consumer of the state can be sure to get the latest instance.
2. Only mutate the state through actions, which get called with the latest state.

We decided to implement both strategies, because the action functions not only make sure the latest state is passed, but also, make the code more readable.

#### Without Diffing:

Problems:
**1. Rerendering while filling in a form**
If the whole form get's rerenderd while the user is filling it out the focus gets not set correctly by default.
This causes unexpected behavior if the user for instance tries to check a checkbox right after editing a text field:
<<GIF showing the problem>>

## Result
