# Huerto - Iteration 02

## Conversation

>> Customer: Wow! That was quick!
>
>> Developer: Sure thing, that's because I didn't had to use a framework for it.
>
>> Customer: A framewhat? Nevermind. Tell you what, three tomates have already grown on my tomato vine. Now I also want to know how many pieces of each vegetable I own. Could you let me add the amount as well? 
>
>> Developer: Will do!
>
>> Customer: Nice! Oh, and before I forget.. It took me a while to figure out that I need to press *Enter* to submit my entry. Sometimes, I accidentally pressed it twice and than I had empty entries in my list. Can you please add an *Add* button for me and also prevent me from entering empty items. You're the best!
>
>> Developer: Ok.

## Developer Thoughts

- Should I use `<form>`
- HTML5 vs JS Validation
- Handeling empty input fields

The evaluation of the different ideas can be found [here](../../research/02)

## Result

Using a `form` tag has many advantages, some of them are the following:

- Ability to [reset](<https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset>) the whole form
- Ability check the validity of all form elements if HTML5 validation is used
- Ability to get all form [elements](<https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/elements>) within the form without knowing the elements specifically
- Increased accessibility for screen readers

All of these contributed to desicion to use `form` tags for our project.


