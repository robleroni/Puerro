# Puerro Project

The goal of this project is to acquire knowledge about how to build modern frontend web applications as simple as possible by researching different approaches.

## Idea

To not loose our train of thought, we need to have a structured method on how to handle the research process.

The idea is to build a showcase project by simulating interactions between a developer and a customer.

- **Customer**: wants an easy to use and modern web application
- **Developer**: wants to develop the application as simple as possible

Therefore, the developer needs to research and evaluate different approaches to build the application
as simple as possible while still meeting customer demands.

The showcase application should build up on well-known [UI-Patterns](http://ui-patterns.com/patterns).

## Folder Structure

| Folder             | Description                                       |
| ------------------ | ------------------------------------------------- |
| [docs/](docs/)     | Documentation like the logbook                    |
| [huerto/](huerto/) | Showcase project of the research process          |
| [puerro/](puerro/) | Abstractions and utilities for the huerto project |
| [test/](test/)     | All the test results combined in one place        |

## Build instructions

### Requirements

Tested with:

- npm version _6.4.1_ and _6.7.0_
- node version _10.11.0_ and _11.10.1_

### How to run

```
npm install     // to install the dev dependency 'rollup'
npm start       // to bundle the scripts and watch for changes
```

### How to test/verify

| Repository online                         | verify local code              |
| ----------------------------------------- | ------------------------------ |
| [All Tests](test/AllTests.html)           | `open test/AllTests.html`      |
| [Puerro Tests](test/PuerroTests.html)     | `open test/PuerroTests.html`   |
| [Huerto Tests](test/HuertoTests.html)     | `open test/HuertoTests.html`   |
| [Research Tests](test/ResearchTests.html) | `open test/ResearchTests.html` |
