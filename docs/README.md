# Puerro - Logbook

This is what's happening in the Puerro Project (newest first):

# Module systems and persistence problems (19.03.2019)
We have to figure out how use our module system more consistently, currently we have some inline exports and some at the end of the files. Furthermore we have to decide if we will continue to use a module bundler (rollup) or es6-modules and a Dev-Server during development.

Interacting with persistence systems (or services, which in turn interact with those systems), is a difficult problem in web development. We could think about simulating a persistence system to analyze and solve occuring problems. One main problem which was discussed, is getting the identity of a new entry in a frontend system which is hard to solve.

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

We decided to use the lightweight module bundler *rollup.js*.

# Showcase Project for Structure (26.02.2019)

After looking at some simple forms, things got crowdy very fast.
There are a million things, which can be considered.
We knew that we can not cover everything with this project.

We decided that we need some more structure to not get lost in our train of thought.
Eventually, the idea came to life to build a showcase project by simulation interactions between developer and customer.

The project should cover the most important UI-patterns while keeping it as simple but still very usable at the same time.


# Simple Forms (19.02.2019)

To start the research process, we decided to look at the most common [UI patterns](http://ui-patterns.com/).

The first patterns that appear are about *getting input* from an user.

So we created two simple forms. One with the help of the angular framework and one without a framework.

## Result
For this simple case of a form, the framework is clearly an overkill.

**TODO**: We probably should define some criteria to evaluate results..
Problem -> Idea/Approach -> Implementation -> Evaluation


# Kick-Off (19.02.2019)

We started our IP5 project with the goal to research the most simple approaches to develop user interfaces for modern web applications.

## The Problem

Nowadays, most web UI's depend on front-end frameworks/libraries (like Angular, Vue or React). These technologies are powerful, but they also lock programmers in by making it difficult to have a presentation layer independent of the rendering technology.

Each technology has their own *way of working* which doesn't integrate with others.

This makes it, especially in the fast chaning web front-end world, a challenging problem.

It takes a lot of time to learn a new framework/library and to build an application with it.

This could be a bad investiment, as the technology is very likely outdated soon and the application would need to be rebuild nearly from scratch.

## The Goal

The goal of this project is to explore new, unconventional, and unorthodox approaches to Web UI development with JavaScript and validate their usefulness against typical UI patterns.

Hopefully finding a way to become independent of today's frameworks.