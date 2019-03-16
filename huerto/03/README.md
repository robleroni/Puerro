# Huerto - Iteration 03

## Conversation

## Developer Thoughts

- Should I use `<form>`
- HTML5 vs JS Validation
- Handeling empty input fields

## Result

Using a `form` tag has many advantages, some of them are the following:

- Ability to [reset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset) the whole form
- Ability check the validity of all form elements if HTML5 validation is used
- Ability to get all form [elements](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements) within the form without knowing the elements specifically
- Increased accessibility for screen readers

All of these contributed to desicion to use `form` tags for our project.

| Evaluation                     | Implementation (Demo)        | Test Results           |
| ------------------------------ | ---------------------------- | ---------------------- |
| [Season 03](../../research/03) | [03 - Validation](demo.html) | [Tests 03](tests.html) |
