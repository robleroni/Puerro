# MVC
MVC has been around in the software development world for quite a while and is a well established way to create software. It is a type of application architecture which focuses very much on separation of concerns.

## The MVC Way

A MVC application is divided into _Model_, _View_ and _Controller_.  The *Model* is defining and storing the data, it does not care how the data is presented to the client. Any interactions made by the user, that affect the *Model* have to go through the *Controller*. The *Controller* then figures out how the *Model* has to be changed given the user input. The view listens to changes in the *Model* and makes changes in the representation of the data accordingly.

![MVC](assets/img/MVC.png)

[MVC Wikipedia](https://en.wikipedia.org/wiki/Model–view–controller)

As visible in this visualization of the MVC flow, data always flows unidirectionally. This makes the application easier to reason about and more predictable, since the model cannot just be changed from anywhere. 

Since all actions are made through the controller, the interface of how data can be aggregated and manipulated is clearly defined. This is especially useful with large scale applications. The MVC pattern also makes it easier to unit test an application, since the logic and the view are clearly separated and can be tested independently.

```js
const Model = () => {
    const name = Observable('');
    return {
        name,
    }
}

const Controller = model => {
    const setName = name => {
        // possible business logic, like validation
        model.name.set(name);
    }
    
    return {
        onNameChange: model.name.onChange,
        setName,
    }
}

const View = (controller, $form, $output) => {
    render = name => ($output.innerText = name);
    
    // View-Binding
    $form.name.addEventListener('input', evt => {
        controller.setName(evt.target.value);
    });
    
    // Model-Binding
    controller.onNameChange(render);
}

View(
    Controller(Model()),
    document.getElementById('form'), 
    document.getElementById('output')
);
```

As evident by this example, MVC can generate some boilerplate code which seems over the top for small applications. But especially when the application scales, the advantages become very visible, the business logic sits in one place and the model cannot be changed but through this business logic. Especially compared to the just mutating the DOM and application state from anywhere in the code this approach makes the application way more predictable and easier to understand.

## Independent view layer

The MVC pattern does not concern itself with how the page is rendered, the views can be done in different ways. In the previous example the DOM was manipulated directly, but this is just one way of handling the view layer. The view can for example also be rendered with the virtual DOM which ensures all the benefits, that the VDOM brings.  The following example shows how the virtual DOM can be integrated in the MVC pattern.

```js
const View = (controller, $form, $output) => {
    const view = name => h('span', { }, name);
    
    const render = name => {
        $output.replaceChild(renderVDOM(view(name)), $output.firstChild);
    }
    // same as before...
}
```

## Bidirectional binding

Many modern frontend frameworks like Vue.js and Angular (not React) work with bidirectional bindings of data. This is intuitive at first but as an application grows can become very unpredictable. The model can be changed from anywhere and business logic has to be enforced with different approaches, for example in Vue.JS using [watchers](https://vuejs.org/v2/guide/computed.html#Watchers).

MVC does not permit bidirectional binding by design which might feel like a restriction from time to time but is essential to prevent bugs and keep the codebase understandable and maintainable. If it would allow bidirectional binding the graph would look like this:

![MVC](assets/img/MVC-Bidirectional.png)

This would defeat the whole purpose of the controller, by leaving it out.

- controller
- seperation of concerns
- cycle
- bidirectional vs unidirectional

mvc only concept: 
- possible to combine with dom manipulation, vDom/Components

- restrictions:
- global store