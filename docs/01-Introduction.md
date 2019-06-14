# Introduction

The Puerro project is a knowledge acquisition about how to build modern frontend web applications as simple as possible by researching different approaches. It can be used as a [knowledge base](https://robin-fhnw.github.io/IP5-Puerro/docs) or in combination with the provided [abstractions](https://robin-fhnw.github.io/IP5-Puerro/src).

## About Web Development

Coding for the web means that the end-user can access the result through a browser (e.g.: Chrome, Firefox, Safari, Edge or Internet Explorer).

A browser can request data from different sources (servers) and display the received content.
This content is usually a combination between these 3 different programming languages:

- **HTML**: Describes the content and structure of the page
- **CSS**: Describes the presentation of the page
- **JavaScript**: Adds behaviour to the page - and makes it more dynamic

A website is **static** when its content is fixed. It only uses HTML/CSS and there is no way to interact with it (other than linking to other pages). If you print it out, it still works.

A website is **dynamic** when its content or structure changes. This can be achieved with a server-side (backend) or client-side (frontend) approach. When the content changes from being just informational to being more interactive, we say that it is a **web application**.

With a **Server-Side** approach, the logic runs on the server, modifies the web page and sends the result back to the client. There are several programming languages available to work with it, like _PHP_, _Ruby_, _Java_ etc.

With a **Client-Side** approach, a script runs in the browser of the user. This is being achieved with the delivered **JavaScript**.

Both approaches have their advantages and disadvantages.

One disadvantage of the server-side approach is, that with every request the browser needs to reload the whole page. This is very time consuming and doesn't provide a great user experience.

Amongst other reasons, that is why the modern way to develop web applications is with client-side scripting.

Client-side scripting allows for remote API calls (also known as **Ajax** calls). With these the browser can asynchronously load only the data needed and dynamically change the web page with JavaScript. This provides a much better user experience as the page doesn't need to reload completely.

## Purpose

Nowadays, most web UI's depend on front-end frameworks/libraries (like Angular, Vue or React). These technologies are powerful, but they also lock programmers in by making it difficult to have a presentation layer independent of the rendering technology.

Each technology has their own _way of working_ which doesn't integrate well with others.
This makes it, especially in the fast changing web front-end world, a challenging problem.

It takes a lot of time to learn a new framework/library and to build an application with it.
This could be a bad investment, as the technology is very likely outdated soon, and the application would need to be rebuild nearly from scratch.

Additionally, they usually build up a huge dependency chain. This means that you, as the end-developer, can't control every part of your application. If only one of the dependencies is insecurely built, fails, or runs something which it is not supposed to, it puts your entire application at risk.

The goal of this project is to explore new, unconventional, and unorthodox approaches for frontend web development with JavaScript and validate their usefulness against typical UI patterns.

## Methodology

The purpose of this project is to research and evaluate frontend approaches which can be done in different ways. One of the main concerns is, that the different ideas are not only looked at on an abstract level far from reality. That is why the main research for this project is done as a project simulation. This simulation is separated into iterations with ever increasing requirements for a fictional web application.

With each iteration the imaginary customer communicates requirements to the developer which is implementing them. With the specification in place, multiple approaches are evaluated, and one is chosen to implement the customers wishes.

The claims made during this project documentation would lose their significance with a project that is too specific. That is why the outcome of the fictional project is essentially a CRUD (Create, Read, Update, Delete) application with different views. Implementing CRUD's is also one of the main purposes of many of the modern frontend frameworks and generally a good use case to test the hypotheses made during the project.

## Scope

To make our examples and research work in real-life scenarios there would be a need for backend systems to store data and handle business logic. The scope of this project, however, is limited to client-side scripting. This restriction is put in place to ensure, the project does not scratch the surface of different parts of web development, but to dive deep into the specific world of frontend development.

To explore how JavaScript and HTML work and interact with each other in depth, styling, specifically CSS is also considered out of scope.

Build tooling and browser compatibility is a big part in today's frontend world. Again, to keep the focus and not get distracted by tooling, this project is respecting the following standards and the browsers which support those:

- HTML5
- CSS3
- ES6 (JavaScript version)

## Coding Conventions

### Testability

Since the code for the web behaves differently for each browser and version, it is especially important to write test cases. At the same time, the technologies are changing constantly in the web community. Therefore, we need a way to always make sure that the code is running as it is supposed to.

There are many different types of testing. We want to use unit testing and functional (frontend) testing.

- Unit Testing: To test the created abstractions (developer-view)
- Functional (frontend-only) Testing: To test the Huerto iterations for its functionality (customer-view)

For the actual testing, there are many different tools available to support the process. These are powerful but also complicated. That is why we decided to write our own little [testing utility](../../src/test/test.js).

Basically, we just need a way to compare two values for equality, report the result and give some detailed information in case of failure. Most of our tests will run in the browser and are using the DOM.
With this testing utility, we are using the executional context of the tests simultaneously for the final report.

This also brings the advantage of being able to run the tests with a desired browser and check if it still works.

### Bundling

In JavaScript, the code to be executed needs to be loaded into the same namespace. This can create name clashes and comes with some safety issues, as suddenly external code can run a module's internal methods.

Until ES5 this problem has been handled with the _Revealing Module Pattern_ which uses IIFE's and its function scope to hide the internal variables and methods. Since ES6, JavaScript supports modules which can be exported and imported.

In this project we presuppose an ES6 environment and use the ES6 modules.

These modules, however, are loaded using the _Same-Origin_ policy. This basically means that a web server is needed to serve the files. To develop locally, we would need to run a local web server or use a bundler.

- The local web server would add the needed headers to comply with the _Same-Origin_ policy but could create cashing problems.
- The bundler would create IIFE's out of the modules and put it all together in one file. With this approach name clashes could appear.

We decided to use the bundler _rollupjs_ to allow us to develop locally without the use of a web server.

We also want to provide the easiest possible way to interact with our findings. Therefore, we decided to go against the general recommendation of not checking in generated artefacts. This brings the advantage that our GitHub project can be cloned and used, without the need to generate the bundles first.

### JSDoc

To provide a better code understanding, we use the markup language JSDoc to annotate our JavaScript files. Using JSDoc comments, we describe the interface and usage of our functions. As with Javadoc, JSDoc can be used to generate a documentation in accessible formats like HTML. Another powerful feature of JSDoc is that in in modern text editors (e.g. VS Code or WebStorm) the type of the parameters can be taken into consideration. This allows to use a better intellisense and provides a way for checking types.

### Variables Notation

To better differentiate between our variables, we prepend them with the following prefixes:

- `$` - when referring to real DOM's, e.g. `$div`
- `v` - when referring to virtual DOM's, e.g. `vDiv`

In case variables are unused and can be ignored, we will simply use an underscore to signalize  that it is _throwawayable_.

```js
$element.addEventListener('click', _ => console.log('clicked'));
```

[← Table of Content](README.md) | [DOM →](02-DOM.md)
