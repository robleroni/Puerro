# Iteration 2

Problem -> Idea/Approach -> Implementation -> Evaluation

## Requirements/Problems

- Validation

## Ideas/Approaches

- [HTML5 Validation](html5-validation)
- [JS Validation](js-validation)

## Evaluation
HTML5 validation is easier to use from a developer experience perspective. As a developer the validation API provides useful attributes and functions to validate forms. HTML5 validation also provides pseudo classes to style our forms differently based on the state. The downside is, that it is more complex to create custom error messages and style them differently than the default messages, but it is entirely possible.

To get JS-validation to work on a larger scale we would need to abstract the validation. Else the developer experience would suffer exteremly, as soon as we have different validation requirements for different fields (not only `required`). The advantage here is that we are absolutley free in how we give feedback to the user.