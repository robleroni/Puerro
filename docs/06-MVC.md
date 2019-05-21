# MVC
MVC is a pattern which focuses very much on separation of concerns. A MVC application is divided into _Model_, _View_ and _Controller_. The *Model* is defining and storing the data, it does not care how the data is presented to the client. Any interactions made by the user, that affect the *Model* have to go through the *Controller*. The *Controller* then figures out how the *Model* has to be changed given the user input. The view listens to changes in the *Model* and makes changes in the representation of the data accordingly.

![MVC](Z:\Dev\Git\1_github\IP5-Puerro\assets\img\MVC.png)

[MVC Wikipedia](https://en.wikipedia.org/wiki/Model–view–controller)

As visible in this visualization of the MVC flow, data always flows unidirectionally. This makes the application easier to reason about and more predictable, since the model cannot just be changed from anywhere. 

Since all actions are made through the controller the interface of how data can be aggregated and manipulated is clearly defined. This is especially useful with large scale applications. The MVC pattern also makes it easier to unit test an application, since the logic and the view are clearly separated and can be tested independently.

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

The MVC pattern does not concern itself with how the page is rendered, the views can be done in different ways. This leaves the door open to implement the view with for example the virtual DOM. In the example from before this could look something like this:

```js
const View = (controller, $form, $output) => {
    render = name => {
        const view = h('span', { }, name);
        $output.replaceChild(renderVDOM(view), $output.firstChild);
    }
    // same as before...
}
```





- controller
- seperation of concerns
- cycle
- bidirectional vs unidirectional

mvc only concept: 
- possible to combine with dom manipulation, vDom/Components

- restrictions:
- global store