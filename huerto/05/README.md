# Season 05 - Different Views

| Implementation (Demo)             | Test Results           |
| --------------------------------- | ---------------------- |
| [05 - Different Views](demo.html) | [Tests 05](tests.html) |

## Conversation

> > **Customer**: Thank you so much, the site looks great and I can fill in and edit all my Veggies!
>
> > **Developer**: No worries, was a pleasure.
>
> > **Customer**: There is one more thing. I am kind of losing track of my vegetables. Could you add some overview/statistics about my vegetables?
>
> > **Developer**: Of course! I could add a vegetable counter and how many of these are already planted.
>
> > **Customer**: That would be the perfect final touch. It would also be nice to see how many vegetables of each origin I own.
>
> > **Developer**: Consider it done!

## Development Process

### Different views and state management

We now have a central state which needs to be represented in different ways.
There are two main approaches with which this can be done.

**Component based**

In a component-based system, the central state is injected into each component and is mutated either through direct mutations on the state or actions which mediate the mutations. This approach was popularized by https://redux.js.org and is currently widely used.

**MVC**

MVC is a pattern which focuses very much on separation of concerns. A MVC application is divided into _Model_, _View_ and _Controller_. The Model is defining and storing the data, the view provides a way to display this data and the controller is used for business logic and mutations of the model. Since all actions are made through the controller, the interface of what is possible is clearly defined. This is especially useful with large scale applications. The MVC pattern also makes it easier to unit test an application, since the logic and the view are clearly separated and can be tested independently.

In our implementation of the MVC pattern we also

## Result

- descrutering - getter
