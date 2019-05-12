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

MVC is a pattern which focuses very much on separation of concerns. A MVC application is divided into _Model_, _View_ and _Controller_. The Model is defining and storing the data, the view provides a way to display this data and the controller is used for business logic and mutations of the model. Since all actions are made through the controller the interface of what is possible is clearly defined. This is especially useful with large scale applications. The MVC pattern also makes it easier to unit test an application, since the logic and the view are clearly separated and can be tested independently.

## Result

We decided to work with a MVC style pattern to implement our final version of the vegetable garden. To handle the rendering and state management we used a base controller to avoid duplicating code for each controller. 

### Global vs. local state

One of the main problems was to differentiate between global application state and local state in a specific controller. There is data which is used all over the application, in our case mainly the `vegetables` array. This is the array where the vegetables are saved and accessed from each view. On the other hand there is local data which is only accessed within one view-controller pair, for instance the state of the vegetable form. 

The first approach to resolve the issue of global state, was to pass events between the controllers to notify each other when the state changes, i.e.:
```js
// script.js
listController.addEventListener('onAddVegetable', vegetable => formController.selectVegetable(vegetable));
formController.addEventListener('onSaveVegetable', vegetable => listController.updateVegetable(vegetable));
```
This approach worked as expected, but we soon realized that it does not scale well especially for state that is used in more than two controllers. 

We found that a more efficient method is to include a static `store` in the base controller of "Puerro". This `store` would hold data which is used in more than one controller. 

To resolve this we included a static `store` in the base controller of "Puerro". Global data which is used in more than one controller is saved in this `store`. The main problem with this approach is, that it can be confusing to figure out if the local `state` or the global `store` has to be updated in a specific instance.  This is illustrated perfectly in the `addVegetable`  method of the `ListController`:

```js
this.store.set({
    vegetables: [...this.model.vegetables, vegetable],
});
this.state.set({ selected: vegetable })
```

In this method both store and state are changed and it is important to know what data is stored where.

### Maintain focus...

### View Children....


- descrutering - getter
