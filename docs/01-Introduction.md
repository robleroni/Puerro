# Introduction

The Puerro project is a knowledge acquisition about how to build modern frontend web applications as simple as possible by researching different approaches. It can be used as a [knowledge base](https://robin-fhnw.github.io/IP5-Puerro/docs) or in combination with the provided [abstractions](https://robin-fhnw.github.io/IP5-Puerro/src).

## About Web Development

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


## Purpose

Nowadays, most web UI's depend on front-end frameworks/libraries (like Angular, Vue or React). These technologies are powerful, but they also lock programmers in by making it difficult to have a presentation layer independent of the rendering technology.

Each technology has their own _way of working_ which doesn't integrate well with others.
This makes it, especially in the fast changing web front-end world, a challenging problem.

It takes a lot of time to learn a new framework/library and to build an application with it.
This could be a bad investment, as the technology is very likely outdated soon and the application would need to be rebuild nearly from scratch.

Additionally, they usually build up a huge dependency chain. This means that you, as the end-developer, can't control every part of your application. If only one of the dependencies is insecurely built, fails, or runs something which it is not supposed to, it puts your entire application at risk.

The goal of this project is to explore new, unconventional, and unorthodox approaches for frontend web development with JavaScript and validate their usefulness against typical UI patterns.

## Methodology

The purpose of this project is to research and evaluate frontend approaches which can be done in different ways. One of the main concerns is, that the different ideas are not only looked at on an abstract level far from reality. That is why the main research for this project is done as a project simulation. This simulation is separated into iterations with ever increasing requirements for a fictional web application.

With each iteration the imaginary customer communicates requirements to the developer which is implementing them. With the specification in place, multiple approaches are evaluated and one is chosen to actually implement the customers whishes. 

The claims made during this project documentation would lose their significance with a project that is too specific. That is why the outcome of the fictional project is essentially a CRUD (Create, Read, Update, Delete) application with different views. Implementing CRUD's is also one of the main purposes of many of the modern frontend frameworks and generally a good use case to test the hypotheses made during the project. 

## Scope

To make our examples and research work in real-life scenarios there would be a need for backend systems to store data and handle business logic. The scope of this project, however, is limited to client-side scripting. This restriction is put in place to ensure, the project does not scratch the surface of different parts of web development, but to dive deep into the specific world of frontend development. 

To explore how JavaScript and HTML work and interact with each other in depth, styling, specifically CSS is also considered out of scope.

Build tooling and browser compatibility is a big part in todays frontend world. Again to keep the focus and not get distracted by tooling, this project is respecting the following standards and the browsers which support those:

- HTML5
- CSS3
- ES6 (JavaScript version)

