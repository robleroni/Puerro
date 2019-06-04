# Puerro - Logbook

This is what's happening in the Puerro Project (newest first):

# Memory Leaks and Clean Code (30.04.2019)

## Memory Leaks

When too many event listeners are being registered which are no longer used, memory leaks can occur.
The listener keeps the memory occupied even if it is no longer in used. It has to be manually unregistered.

A possible solution for this would be to remove the listner in the observable list delete method.
For this the onDelete function could return a function to remove the listener.

```js
controller.onDelete(((model, removeMe) => removeMe()) // removes listener from the listeners array in the observable list
```

## Full import URI's

Some browsers could have problems when not specifying the whole path to a imported resource.
Therefore, it is advisable to always use the full path in the import statement (inclunding the file ending).

## Code Alignment

For better visibility and faster code understanding it is advisable to align code which is similar.

# Clean MVC (09.03.2019)

The term MVC (Model-View-Controller) has been misused in recent year, for different patterns. It would be interesting to go back to the core of what MVC is and try to implement it in different JavaScript use cases.

Although diffing is not necessarily benefitial to the performance of a web application, it is useful for other situations. For instance if a view is rerendered completely it loses its identity. Previously focused elements lose their focus because they are replaced with new element instances. ([see huerto 04](../huerto/04/README.md))

# Diffing needed? and Yoda conditions (26.03.2019)

We created a VDOM implementation and drafted a first idea on how to do diffing. During our weekly meeting the question came up, if diffing is actually needed or the DOM interaction is more performant if we replace the whole DOM-tree on each change. To test that we will create demos with the two different implementations.

We were introduced to a concept called yoda conditional which is less prone to developer errors than the standard approach. For instance the following snippet:

```js
if (foo == null) {
  return;
}
```

becomes:

```js
if (null == foo) {
  return;
}
```

This makes sure that unwanted assignments cannot happen (for instance `if (null = foo)`)

# Module systems and persistence problems (19.03.2019)

We have to figure out how use our module system more consistently, currently we have some inline exports and some at the end of the files. Furthermore we have to decide if we will continue to use a module bundler (rollup) or es6-modules and a Dev-Server during development.

Interacting with persistence systems (or services, which in turn interact with those systems), is a difficult problem in web development. We could think about simulating a persistence system to analyze and solve occurring problems. One main problem which was discussed, is getting the identity of a new entry in a frontend system which is hard to solve.

Validation should not only be looked at from the angle of isolated fields. We should take into consideration validation problems which occur on fields that interact with each other. The typical example would be validating if a begin-date is smaller than an end-date.

# Dependency management and form visualisation (12.03.2019)

We don't use many dependencies (at the moment only one direct dependency - rollup.js) and want to keep it that way. To ensure the best possible consistency we will use fixed version numbers in our package.json.

Forms increase in complexity the more inputs there are and the more the inputs interact with each other and the rest of the DOM. We will try to visualize all inputs and interactions of our demos to get and idea of how much the complexity rises and find out where to begin with abstractions for our project.

# Using the ES6 module system (05.03.2019)

To make the developing process more modular and better testable, we decided to use the integrated module system.
With this we can simply `export` and `import` the reusable code.
However, ES6 modules are loaded using CORS. Therefore, we can not simply import the external file locally like with the `<script>` tag.
To solve this problem we can choose either option:

- Running a local webserver which serves the files with the CORS header
  - This could return in caching problems
- Allow the browser to load files without the CORS header
  - Very unsafe, if the browser is used for normal use as well.
- Use a module manager which bundles the module in a single file and include this file with the `<script>` tag.
  - Possible name clashes

We decided to use the lightweight module bundler _rollup.js_.

# Showcase Project for Structure (26.02.2019)

After looking at some simple forms, things got crowdy very fast.
There are a million things, which can be considered.
We knew that we can not cover everything with this project.

We decided that we need some more structure to not get lost in our train of thought.
Eventually, the idea came to life to build a showcase project by simulation interactions between developer and customer.

The project should cover the most important UI-patterns while keeping it as simple but still very usable at the same time.

# Simple Forms (19.02.2019)

To start the research process, we decided to look at the most common [UI patterns](http://ui-patterns.com/).

The first patterns that appear are about _getting input_ from an user.

So we created two simple forms. One with the help of the angular framework and one without a framework.

## Result

For this simple case of a form, the framework is clearly an overkill.

**TODO**: We probably should define some criteria to evaluate results..
Problem -> Idea/Approach -> Implementation -> Evaluation

# Kick-Off (19.02.2019)

We started our IP5 project with the goal to research the most simple approaches to develop user interfaces for modern web applications.

## The Problem

Nowadays, most web UI's depend on front-end frameworks/libraries (like Angular, Vue or React). These technologies are powerful, but they also lock programmers in by making it difficult to have a presentation layer independent of the rendering technology.

Each technology has their own _way of working_ which doesn't integrate with others.

This makes it, especially in the fast changing web front-end world, a challenging problem.

It takes a lot of time to learn a new framework/library and to build an application with it.

This could be a bad investment, as the technology is very likely outdated soon and the application would need to be rebuild nearly from scratch.

## The Goal

The goal of this project is to explore new, unconventional, and unorthodox approaches to Web UI development with JavaScript and validate their usefulness against typical UI patterns.

Hopefully finding a way to become independent of today's frameworks.
