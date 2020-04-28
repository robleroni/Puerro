# Season 03 - Validation

| Implementation (Demo)        | Test Results           |
| ---------------------------- | ---------------------- |
| [03 - Validation](demo.html) | [Tests 03](tests.html) |

## Conversation

> > **Customer**: The Website looks great, thank you so much!
>
> > **Developer**: No worries!
>
> > **Customer**: I do have a slight problem though: Currently I can just add anything I want even if it doesn't make sense. For instance a vegetable without a name, or tubers which came from Asia, imagine that!
>
> > **Developer**: Sure I could validate what you put in and check if it meets your expectations. Could you provide me with a list of what you think is expected from an entry to be considered as a valid vegetable?
>
> > **Customer**: Of course I would think the following restrictions are essential:
> >
> > - Vegetables have to have a name
> > - Vegetables have to have an origin
> > - I can't have 0 vegetables planted
> > - Tubers cannot originate from Asia
> > - Fungi cannot originate from America
>
> > **Developer**: Perfect, thank you very much.

## Development Process

- How should I handle required fields and min values?
- How should I validate combined values?
- Do I use HTML5 or pure JS Validation?
- Should I somehow abstract the form-input creation and validation?

## Result

HTML5 validation is easier to use from a developer experience perspective. As a developer the validation API provides useful attributes and functions to validate forms. HTML5 validation also provides pseudo classes to style our forms differently based on the state. The downside is, that it is more complex to create custom error messages and style them differently than the default messages, but it is entirely possible.

To get JS-validation to work on a larger scale we would need to abstract the validation. Else the developer experience would suffer exteremly, as soon as we have different validation requirements for different fields (not only `required`). The advantage here is that we are absolutley free in how we give feedback to the user.
