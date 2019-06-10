# Season 01 - The Beginning of Huerto

| Demo                                      | Tests                  |
| ----------------------------------------- | ---------------------- |
| [01 - The Beginning of Huerto](demo.html) | [Tests 01](tests.html) |

## Conversation

> > **Customer**: Yo, I've heard that you are studying something with computers. Can you create a quick homepage for me?
>
> > **Developer**: Hey! The web is awesome, but computer science is about much more than the web. Not every computer scientist creates content for the web. And it's called website - not homepage.
>
> > **Customer**: Yes! Website! See, you know what I'm talking about. I want to start my own vegetable garden and I think that I need some technological support. I've heard a lot about Big Data, Cloud and AI lately. That's why I want a website!
>
> > **Developer**: So you need a web application to manage your vegetable garden.. What should it be able to do?
>
> > **Customer**: Good question! I don't really know yet. I'm a little forgetful, so it would be nice if I can enter my vegetables. With this I could see what I have planted in my garden.
>
> > **Developer**: I am currently experimenting a bit with the creation of web applications anyway. I could probably use your idea for that. I'll create a simple solution and come back to you.

## Development Process

### Coding for the Web

Coding for the web means that the end-user can access the result trough a browser (e.g.: Chrome, Firefox, Safari, Edge or - unfortunately - Internet Explorer).

A browser can request data from different sources (servers) and display the received content.
This content is usually a combination between these 3 different programming languages:

- **HTML**: Describes the structure of the page
- **CSS**: Describes the presentation of the page
- **JavaScript**: Adds behaviour to the page - and makes it more dynamic

A website is **static** when its content is fixed. It only uses HTML/CSS and there is no way to interact with it (other than linking to other pages). If you print it out, it still works.

A website is **dynamic** when its content can change. This can be achieved with server-side (backend) or client-side (frontend) scripting. When the content changes from being just informational to being more interactive, we say that it is a **web application**.

With **Server-Side Scripting**, the script runs on the server, modifies the web page and sends the result back to the client. There are several programming languages available to work with it, like _PHP_, _Ruby_, etc.

With **Client-Side Scripting** the script runs in the browser of the user. This is being achieved with the delivered **JavaScript**.

Both scripting approaches have their advantages and disadvantages.

One disadvantage of the server-side scripting is, that with every request the browser needs to reload the whole page. This is very time consuming and doesn't provide a great user experience.

Amongst other reasons, this is why the modern way to develop web applications is with client-side scripting.

Client-side scripting allows for **Ajax** calls. With these the browser can asynchronously load only the data needed and dynamically change the web page with JavaScript. This provides a much better user experience as the page doesn't need to reload completely.

### Ground Rules

This project is going to be implemented with the client-side scripting (frontend) approach. To make the project usable in a real-life scenario, we would also need a backend part which delivers and stores the data. However, we are only interested in how to build the frontend part and therefore simply ignoring or simulating the backend.

One challenge is to support multiple browsers and versions.
There are different companies which provide different browsers and each company decides how to handle the received content (HTML, CSS, JS). Therefore, each browser behaves a little different.

Luckily, there are standards and the modern browsers behave mostly the same.
To fully support different browsers however, we would either need to develop a little different version for each browser (and version) or use a compiler to handle this.

For this project we are using the following standards:

- HTML5
- CSS3
- ES6 (JavaScript version)

Use a backword compiler like [Babel](https://babeljs.io/) if it doesn't run in your browser.

### Available Tools/Libraries/Frameworks

The amount of available tools, libraries or frameworks to support every aspect of frontend development are endless.
For every just so little problem there are multiple solutions ready to be used.

The big names for building frontend web applications are _Angular_, _React_ and _Vue_.

The question is: Should we use any of these? And if so, which ones?

The challenge in this first iteration is to handle the one input given from the user and simply add its value to a list.
Since this is already an interaction with the website it requires JavaScript to change the list dynamically.

Let's start and try to implement it with and without a framework.

#### [Event Listeners with Pure JavaScript (Vanilla)](research/event-listeners)

JavaScript can listen on events that happen to HTML elements and change the DOM (Document Object Model).
There is not much more needed for this task than an event listener on the input field.

![Flow Charts](assets/img/flowchart.png)

#### Angular, React, Vue

Nowadays, most web UI's depend on front-end frameworks/libraries (like Angular, Vue or React). These technologies are powerful, but they also lock programmers in by making it difficult to have a presentation layer independent of the rendering technology.

Each technology has their own _way of working_ which doesn't integrate with others.

This makes it, especially in the fast-changing web front-end world, a challenging problem.

It takes a lot of time to learn a new framework/library and to build an application with it.

This could be a bad investment, as the technology is very likely outdated soon, and the application would need to be rebuild nearly from scratch.

Additionally, they usually build up a huge dependency chain. This means that you, as the end-developer, can't control every part of your application.
If only one of the dependencies is insecurely built, fails, or runs something which it is not supposed to, it puts your entire application at risk.

Building this first example with one of these frameworks would require a much bigger initial effort than using pure JavaScript.

Because of that and the other downsides from above, we will avoid a framework for the time being and won't create examples for them.

### [Testability](research/testability)

Since the code for the web behaves differently for each browser and version, it is especially important to write test cases.
At the same time, the technologies are changing constantly in the web community.
Therefore, we need a way to always make sure that the code is running as it is supposed to.

There are many different types of testing. We want to use unit testing and functional (frontend) testing.

- Unit Testing: To test the created abstractions (developer-view)
- Functional (frontend-only) Testing: To test the Huerto iterations for its functionality (customer-view)

To test certain functions independently, the application must provide the interfaces.
In JavaScript, the code to be tested needs to be loaded into the same namespace. This can create name clashes and comes with some safety issues, as suddenly external code can run a module's internal methods.

Until ES5 this problem has been handled with the _Revealing Module Pattern_ which uses IIFE's and its function scope to hide the internal variables and methods.
Since ES6, JavaScript supports modules which can be exported and imported.

In this project we presuppose an ES6 environment and use the ES6 modules.

These modules, however, are loaded using the _Same-Origin_ policy. This basically means that a web server is needed to serve the files.
To develop locally, we would need to run a local web server or use a bundler.

- The local web server would add the needed headers to comply with the _Same-Origin_ policy but could create cashing problems.
- The bundler would create IIFE's out of the modules and put it all together in one file. With this approach name clashes could appear.

We decided to use the bundler _rollupjs_ to allow us to develop locally without the use of a web server.

For the actual testing, there are again many different tools available to support the process.
These are powerful but also complicated.
That is why we decided to write our own [testing utility](../../src/test/test.js).

Basically, we just need a way to compare two values for equality, report the result and give some detailed information in case of failure.
Most of our tests will run in the browser and are using the DOM.
With this testing utility, we are using the executional context of the tests simultaneously for the final report.

This also brings the advantage of being able to run the tests with a desired browser and check if it still works.

## Result

Because of simplicity, safety and maintainability, we are implementing this first iteration with pure HTML and JavaScript.
ES6 modules are being used for making it modular and easy testable with a test utility written in VanillaJS.
