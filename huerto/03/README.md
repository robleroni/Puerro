# Season 03 - Validation

## Conversation

> > **Customer**: TODO I accidentally pressed it twice and than I had empty entries in my list
>
> > **Developer**: TODO

## Development Process

- HTML5 vs JS Validation
- Handeling empty input fields

## Result

HTML5 validation is easier to use from a developer experience perspective. As a developer the validation API provides useful attributes and functions to validate forms. HTML5 validation also provides pseudo classes to style our forms differently based on the state. The downside is, that it is more complex to create custom error messages and style them differently than the default messages, but it is entirely possible.

To get JS-validation to work on a larger scale we would need to abstract the validation. Else the developer experience would suffer exteremly, as soon as we have different validation requirements for different fields (not only `required`). The advantage here is that we are absolutley free in how we give feedback to the user.

| Implementation (Demo) | Test Results |
| --------------------- | ------------ |
| [03 - Validation]()   | [Tests 03]() |

