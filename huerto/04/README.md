# Season 04 - Changing Input

| Implementation (Demo) | Test Results |
| --------------------- | ------------ |
| [03 - Validation]()   | [Tests 03]() |

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
> > **Customer**: Yeah ok, you lost me.. but It sure sounds professional.

## Development Process

The form now has quite a lot of fields and its a bit of a pain to programatically fill it with values. Maybe we are at a point where abstracting the DOM could be a good idea.

### ID Management

### Building Form with vDom

#### With Diffing:

Problems:
- Problem with accessing outdated state if the state of different vnode changes
- VNodes which are not changed, are stuck with a node instance of the state. This is a problem, if for example an event gets called and interacts with the old state.

#### Without Diffing:

Problems: 
- 

## Result
