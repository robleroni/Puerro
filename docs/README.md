# Abstract

Nowadays, most web UI's depend on frontend frameworks/libraries (like Angular, Vue or React). These technologies are powerful, but they also lock programmers in by making it difficult to have a presentation layer independent of the rendering technology.

Each technology has their own _way of working_ which doesn't integrate well with others. Therefore, learning a new framework/library could be a bad investment, as the technology might be outdated soon.

With this project, we want to research and evaluate different approaches to build modern frontend web applications as simple as possible. In order to not lose our train of thoughts, we limit this project's scope to frontend development using the technology standards HTML5, CSS3 and ES6.

To simulate real problems, the research process is built around a fictitious CRUD (Create, Read, Update, Delete) [application](../huerto).

It turned out, that there is not one single best way to handle every problem. Depending on the size and complexity of the application, different approaches should be considered.

If the goal is a dynamic informational website or a small web application, without a lot of internal state and little changing parts, the easiest solution is using plain and direct DOM manipulations with JavaScript.

As soon as there is a lot of changing content, direct DOM manipulations can get chunky and hard to maintain. Therefore, it is advisable to use a virtual DOM in order to change multiple elements regularly. A virtual DOM abstraction is useful for single view applications with huge and periodically changing DOM trees.

When developing frontend applications, handling and storing data on the client becomes quickly relevant. Normally, when state changes, the DOM needs to be updated accordingly. Doing this manually could lead to redundant code and doesn't comply with the separation of concerns pattern. Among other options, there is the possibility to combine state management with the virtual DOM and delegating the DOM access to a centralized location.

Another approach to separate the data, view and logic is with the well-known MVC pattern. Using its unidirectionally dataflow has the benefit of an improved understandability and maintainability especially for larger applications with a lot of logic. The only abstraction needed for this to work are observables.

For most applications, using a framework is not necessary. It comes with many dependencies, more features you will ever need, and it is hard to fully understand every peculiarity. Plus, it locks a developer in a predefined structure which makes it hard to switch the technology once started.

Therefore, it is often better to reach for simplicity instead of predetermined complexity.

# Table of Contents

* [Introduction](01-Introduction.md)
  * [About Web Development](01-Introduction.md#about-web-development)
  * [Purpose](01-Introduction.md#purpose)
  * [Methodology](01-Introduction.md#methodology)
  * [Scope](01-Introduction.md#scope)
  * [Coding Conventions](01-Introduction.md#coding-conventions)
* [DOM](02-DOM.md)
  * [Manipulating the DOM](02-DOM.md#manipulating-the-dom)
  * [Event-Driven Actions](02-DOM.md#event-driven-actions)
  * [Testability](02-DOM.md#testability)
  * [Use Cases](02-DOM.md#use-cases)
  * [Problems/Restrictions](02-DOM.md#problems--restrictions)
* [Virtual DOM](03-Virtual-DOM.md)
  * [Creating a Virtual DOM](03-Virtual-DOM.md#creating-a-virtual-dom)
  * [Rendering](03-Virtual-DOM.md#rendering)
  * [Diffing](03-Virtual-DOM.md#diffing)
  * [Testability](03-Virtual-DOM.md#testability)
  * [Use Cases](03-Virtual-DOM.md#use-cases)
  * [Problems/Restrictions](03-Virtual-DOM.md#problems--restrictions)
* [State Management](04-State-Management.md)
  * [State Inside the View](04-State-Management.md#state-inside-the-view)
  * [Keep it Simple](04-State-Management.md#keep-it-simple)
  * [Components](04-State-Management.md#components)
  * [ID Management](04-State-Management.md#id-management)
  * [Testability](04-State-Management.md#testability)
  * [Use Cases](04-State-Management.md#use-cases)
  * [Problems/Restrictions](04-State-Management.md#problems--restrictions)
* [MVC](05-MVC.md)
  * [The MVC Way](05-MVC.md#the-mvc-way)
  * [Bidirectional Binding](05-MVC.md#bidirectional-binding)
  * [Global State](05-MVC.md#global-state)
  * [Testability](05-MVC.md#testability)
  * [Use Cases](05-MVC.md#use-cases)
  * [Problems/Restrictions](05-MVC.md#problems--restrictions)
* [Conclusion](06-Conclusion.md)
